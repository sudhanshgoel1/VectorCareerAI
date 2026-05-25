"""
model_service.py
================
Loads the trained ML artifacts and exposes a single predict() method.

Artifact resolution order (first directory that contains all three files wins):
  1. backend/ml/artifacts/        ← written by ml_old/train_model.py
  2. backend/model_artifacts/     ← legacy / manually placed copies

This means running the training scripts is all you need — no manual copying.
"""

import os
import joblib
import numpy as np


def _find_artifacts_dir() -> str:
    """
    Walk up from this file's location to the backend root, then check
    both known artifact directories in priority order.
    """
    # __file__ = backend/adapters/outbound/ml/model_service.py
    # Four dirname() calls → backend/
    backend_root = os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))
            )
        )
    )

    candidates = [
        os.path.join(backend_root, "ml", "artifacts"),       # training output
        os.path.join(backend_root, "model_artifacts"),        # legacy location
    ]

    required = [
        "career_recommendation_model.pkl",
        "scaler.pkl",
        "label_encoder.pkl",
    ]

    for path in candidates:
        if all(os.path.exists(os.path.join(path, f)) for f in required):
            return path

    # Return the primary path even if missing — error will surface in _load_artifacts
    return candidates[0]


class MLService:
    def __init__(self):
        self.model   = None
        self.scaler  = None
        self.encoder = None
        self.roles   = []
        self._load_artifacts()

    def _load_artifacts(self):
        artifacts_dir = _find_artifacts_dir()
        try:
            self.model   = joblib.load(os.path.join(artifacts_dir, "career_recommendation_model.pkl"))
            self.scaler  = joblib.load(os.path.join(artifacts_dir, "scaler.pkl"))
            self.encoder = joblib.load(os.path.join(artifacts_dir, "label_encoder.pkl"))
            self.roles   = list(self.encoder.classes_)
            print(f"[OK] ML artifacts loaded from: {artifacts_dir}")
            print(f"[OK] Roles: {self.roles}")
        except FileNotFoundError as exc:
            print(f"[WARN] ML artifacts not found: {exc}")
            print("[WARN] Run: python backend/ml_old/data_pipeline.py && python backend/ml_old/train_model.py")

    def reload(self):
        """Hot-reload artifacts after retraining without restarting Flask."""
        self._load_artifacts()

    def predict(self, features: np.ndarray):
        """
        Parameters
        ----------
        features : np.ndarray of shape (1, 7)
            Raw (unscaled) values in order:
            [cgpa, aptitude, programming, data_structures,
             communication, public_speaking, creative_thinking]

        Returns
        -------
        predicted_role : str
        role_scores    : dict  {role_name: suitability_pct}
        """
        if self.model is None or self.scaler is None or self.encoder is None:
            raise ValueError(
                "ML model not loaded. "
                "Run data_pipeline.py then train_model.py first."
            )

        # Apply the same StandardScaler that was fitted on training data.
        # Skipping this step would feed the model values in a completely
        # different distribution than it was trained on.
        scaled = self.scaler.transform(features)

        predicted_index = self.model.predict(scaled)[0]
        predicted_role  = self.encoder.inverse_transform([predicted_index])[0]

        # predict_proba returns one probability per class — multiply by 100
        # to get a human-readable "suitability %" for the frontend.
        proba = self.model.predict_proba(scaled)[0]
        role_scores = {
            self.encoder.inverse_transform([i])[0]: round(float(p) * 100, 1)
            for i, p in enumerate(proba)
        }

        return predicted_role, role_scores


# Module-level singleton — loaded once when Flask imports this module
ml_service = MLService()
