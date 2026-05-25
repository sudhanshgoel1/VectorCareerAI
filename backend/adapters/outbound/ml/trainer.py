"""
trainer.py
==========
On-demand model retraining using real prediction data from the database
combined with the original CSV dataset.

Called by the /api/admin/retrain endpoint.
"""

import os
import threading
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Canonical feature order — must match the order used in predict()
FEATURE_COLS = [
    "cgpa", "aptitude_score", "programming",
    "data_structures", "communication",
    "public_speaking", "creative_thinking",
]

ROLES = [
    "Data Scientist", "Full-Stack Developer", "Cyber Security Analyst",
    "UI/UX Designer", "Cloud Engineer", "Product Manager",
]

_BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
ARTIFACTS_DIR = os.path.join(_BASE_DIR, "model_artifacts")
CSV_PATH      = os.path.join(_BASE_DIR, "data", "student_career_data.csv")

# Global training state — read by the status endpoint
training_state = {
    "status":      "idle",      # idle | running | done | failed
    "started_at":  None,
    "finished_at": None,
    "accuracy":    None,
    "total_samples": None,
    "db_samples":  None,
    "csv_samples": None,
    "error":       None,
    "log":         [],
}
_lock = threading.Lock()


def _log(msg: str):
    print(f"[Trainer] {msg}")
    with _lock:
        training_state["log"].append(msg)


def _load_csv_data() -> pd.DataFrame:
    """Load the original synthetic/CSV dataset if it exists."""
    if not os.path.exists(CSV_PATH):
        _log("CSV dataset not found — using DB data only.")
        return pd.DataFrame()

    df = pd.read_csv(CSV_PATH)

    # Normalise column names to lowercase to match DB columns
    df.columns = [c.lower() for c in df.columns]

    # Map common CSV column name variants to our canonical names
    rename_map = {
        "aptitude_score":        "aptitude_score",
        "programming_skill":     "programming",
        "data_structures_skill": "data_structures",
        "communication_rating":  "communication",
        "public_speaking":       "public_speaking",
        "creative_thinking":     "creative_thinking",
        "recommended_role":      "predicted_role",
    }
    df = df.rename(columns=rename_map)

    # Keep only columns we need
    needed = FEATURE_COLS + ["predicted_role"]
    df = df[[c for c in needed if c in df.columns]]

    # Drop rows with unknown roles
    df = df[df["predicted_role"].isin(ROLES)]
    return df


def _load_db_data(app) -> pd.DataFrame:
    """Pull all prediction records from the database."""
    with app.app_context():
        from backend.adapters.outbound.db.models import Prediction
        rows = Prediction.query.all()
        if not rows:
            return pd.DataFrame()
        data = [{
            "cgpa":             r.cgpa,
            "aptitude_score":   r.aptitude_score,
            "programming":      r.programming,
            "data_structures":  r.data_structures,
            "communication":    r.communication,
            "public_speaking":  r.public_speaking,
            "creative_thinking":r.creative_thinking,
            "predicted_role":   r.predicted_role,
        } for r in rows]
        return pd.DataFrame(data)


def retrain_async(app):
    """Launch retraining in a background thread so the API returns immediately."""
    t = threading.Thread(target=_do_retrain, args=(app,), daemon=True)
    t.start()


def _do_retrain(app):
    """The actual training logic — runs in a background thread."""
    with _lock:
        training_state.update({
            "status":      "running",
            "started_at":  datetime.utcnow().isoformat(),
            "finished_at": None,
            "accuracy":    None,
            "total_samples": None,
            "db_samples":  None,
            "csv_samples": None,
            "error":       None,
            "log":         [],
        })

    try:
        _log("Starting retrain…")

        # 1. Load data from both sources
        df_csv = _load_csv_data()
        df_db  = _load_db_data(app)

        csv_count = len(df_csv)
        db_count  = len(df_db)
        _log(f"CSV rows: {csv_count}  |  DB rows: {db_count}")

        # 2. Merge
        df = pd.concat([df_csv, df_db], ignore_index=True)
        df = df.dropna(subset=FEATURE_COLS + ["predicted_role"])
        df = df[df["predicted_role"].isin(ROLES)]

        total = len(df)
        _log(f"Total usable rows after merge: {total}")

        if total < 30:
            raise ValueError(
                f"Not enough data to retrain ({total} rows). "
                "Run more predictions first."
            )

        # 3. Encode + scale
        X = df[FEATURE_COLS].values.astype(float)
        y = df["predicted_role"].values

        le = LabelEncoder()
        y_enc = le.fit_transform(y)

        # Stratify only if every class has ≥ 2 samples
        counts = pd.Series(y).value_counts()
        can_stratify = counts.min() >= 2
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_enc,
            test_size=0.2,
            random_state=42,
            stratify=y_enc if can_stratify else None,
        )

        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s  = scaler.transform(X_test)

        _log(f"Train: {len(X_train)}  Test: {len(X_test)}")

        # 4. Train Random Forest
        rf = RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
        rf.fit(X_train_s, y_train)

        acc = accuracy_score(y_test, rf.predict(X_test_s))
        _log(f"Test accuracy: {acc * 100:.2f}%")

        # 5. Persist new artifacts (atomic overwrite)
        os.makedirs(ARTIFACTS_DIR, exist_ok=True)
        joblib.dump(rf,     os.path.join(ARTIFACTS_DIR, "career_recommendation_model.pkl"))
        joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
        joblib.dump(le,     os.path.join(ARTIFACTS_DIR, "label_encoder.pkl"))
        _log("Artifacts saved.")

        # 6. Hot-reload the in-memory ml_service so predictions use new model immediately
        from backend.adapters.outbound.ml.model_service import ml_service
        ml_service._load_artifacts()
        _log("ml_service reloaded.")

        with _lock:
            training_state.update({
                "status":        "done",
                "finished_at":   datetime.utcnow().isoformat(),
                "accuracy":      round(acc * 100, 2),
                "total_samples": total,
                "csv_samples":   csv_count,
                "db_samples":    db_count,
            })
        _log("Retrain complete.")

    except Exception as exc:
        _log(f"ERROR: {exc}")
        with _lock:
            training_state.update({
                "status":      "failed",
                "finished_at": datetime.utcnow().isoformat(),
                "error":       str(exc),
            })
