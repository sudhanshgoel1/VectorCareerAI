"""
train_model.py
==============
Trains two classifiers (Random Forest + Decision Tree) on the preprocessed
student dataset, prints a full evaluation report, and saves the best model.

After saving, artifacts are also copied to backend/model_artifacts/ so the
Flask API picks them up immediately without any manual file management.
"""

import numpy as np
import joblib
import os
import shutil
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")
LEGACY_DIR    = os.path.join(BASE_DIR, "model_artifacts")   # kept in sync

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(LEGACY_DIR,    exist_ok=True)

# ── Load preprocessed splits ───────────────────────────────────────────────────
X_train = np.load(os.path.join(ARTIFACTS_DIR, "X_train.npy"))
X_test  = np.load(os.path.join(ARTIFACTS_DIR, "X_test.npy"))
y_train = np.load(os.path.join(ARTIFACTS_DIR, "y_train.npy"))
y_test  = np.load(os.path.join(ARTIFACTS_DIR, "y_test.npy"))

le          = joblib.load(os.path.join(ARTIFACTS_DIR, "label_encoder.pkl"))
class_names = list(le.classes_)

print("=" * 65)
print("  STUDENT CAREER RECOMMENDATION — MODEL TRAINING & EVALUATION")
print("=" * 65)
print(f"\nTraining samples : {len(X_train)}")
print(f"Test samples     : {len(X_test)}")
print(f"Target classes   : {class_names}\n")

# ── Helper ─────────────────────────────────────────────────────────────────────

def evaluate(name, clf, X_tr, y_tr, X_te, y_te):
    clf.fit(X_tr, y_tr)
    y_pred = clf.predict(X_te)
    acc    = accuracy_score(y_te, y_pred)

    print(f"\n{'-'*65}")
    print(f"  {name}")
    print(f"{'-'*65}")
    print(f"  Test Accuracy : {acc * 100:.2f}%\n")

    cm = confusion_matrix(y_te, y_pred)
    print("  Confusion Matrix (rows=Actual, cols=Predicted):")
    header = "  " + "  ".join(f"{c[:6]:>8}" for c in class_names)
    print(header)
    for i, row in enumerate(cm):
        print(f"  {class_names[i][:6]:>8}  {'  '.join(f'{v:>8}' for v in row)}")

    print(f"\n  Classification Report:")
    print(classification_report(y_te, y_pred, target_names=class_names, digits=3))
    return clf, acc

# ── Train ──────────────────────────────────────────────────────────────────────

rf = RandomForestClassifier(n_estimators=300, max_depth=None,
                             class_weight="balanced", random_state=2024, n_jobs=-1)
rf_clf, rf_acc = evaluate("Random Forest Classifier", rf, X_train, y_train, X_test, y_test)

dt = DecisionTreeClassifier(max_depth=10, class_weight="balanced", random_state=2024)
dt_clf, dt_acc = evaluate("Decision Tree Classifier (Baseline)", dt, X_train, y_train, X_test, y_test)

# ── Feature importances ────────────────────────────────────────────────────────
print(f"\n{'-'*65}")
print("  FEATURE IMPORTANCES (Random Forest)")
print(f"{'-'*65}")
feature_names = ["CGPA","Aptitude_Score","Programming_Skill",
                 "Data_Structures_Skill","Communication_Rating",
                 "Public_Speaking","Creative_Thinking"]
bar_char = '#' if os.name == 'nt' else '█'
for feat, imp in sorted(zip(feature_names, rf_clf.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat:<26} {imp:.4f}  {bar_char * int(imp * 60)}")

# ── Save best model ────────────────────────────────────────────────────────────
best_name = "Random Forest" if rf_acc >= dt_acc else "Decision Tree"
best_clf  = rf_clf          if rf_acc >= dt_acc else dt_clf

model_path = os.path.join(ARTIFACTS_DIR, "career_recommendation_model.pkl")
joblib.dump(best_clf, model_path)

# Sync to legacy model_artifacts/ so model_service.py always finds fresh files
for fname in ["career_recommendation_model.pkl", "scaler.pkl", "label_encoder.pkl"]:
    shutil.copy(
        os.path.join(ARTIFACTS_DIR, fname),
        os.path.join(LEGACY_DIR,    fname),
    )

print(f"\n{'='*65}")
print(f"  Best model : {best_name}  ({max(rf_acc, dt_acc)*100:.2f}% accuracy)")
print(f"  Saved to   : {ARTIFACTS_DIR}")
print(f"  Synced to  : {LEGACY_DIR}")
print(f"{'='*65}\n")
