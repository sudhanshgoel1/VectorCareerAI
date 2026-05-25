"""
data_pipeline.py
================
Generates a synthetic dataset of 500 students, preprocesses it, and saves
the cleaned splits ready for model training.

Why synthetic data?
  In a real system this would be replaced by actual survey/academic records.
  For a college project we simulate realistic score distributions so the
  classifier has meaningful patterns to learn — not just random noise.
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# ── Reproducibility ────────────────────────────────────────────────────────────
np.random.seed(2024)

N = 500   # total students to generate

# ── Role profiles ──────────────────────────────────────────────────────────────
# Each role has a "typical" student profile expressed as (mean, std) per feature.
# We sample from a normal distribution and clip to valid ranges so the data
# looks like it came from real assessments.
#
# Feature order:
#   CGPA | Aptitude_Score | Programming_Skill | Data_Structures_Skill |
#   Communication_Rating | Public_Speaking | Creative_Thinking

ROLES = {
    "Data Scientist": {
        # High aptitude + strong coding + moderate communication
        "CGPA":                   (8.5, 0.6),
        "Aptitude_Score":         (85,  7),
        "Programming_Skill":      (8.5, 0.8),
        "Data_Structures_Skill":  (8.0, 0.9),
        "Communication_Rating":   (5.5, 1.0),
        "Public_Speaking":        (4.5, 1.0),
        "Creative_Thinking":      (7.0, 0.9),
    },
    "Full-Stack Developer": {
        # Highest programming + data structures, lower soft skills
        "CGPA":                   (7.5, 0.7),
        "Aptitude_Score":         (70,  8),
        "Programming_Skill":      (9.5, 0.5),
        "Data_Structures_Skill":  (9.0, 0.6),
        "Communication_Rating":   (5.0, 1.0),
        "Public_Speaking":        (4.0, 1.0),
        "Creative_Thinking":      (5.5, 1.0),
    },
    "Cyber Security Analyst": {
        # Highest aptitude, strong programming, low creative
        "CGPA":                   (8.0, 0.7),
        "Aptitude_Score":         (90,  6),
        "Programming_Skill":      (7.5, 0.9),
        "Data_Structures_Skill":  (6.5, 1.0),
        "Communication_Rating":   (6.0, 1.0),
        "Public_Speaking":        (5.0, 1.0),
        "Creative_Thinking":      (4.5, 1.0),
    },
    "UI/UX Designer": {
        # Low coding, highest creative + communication
        "CGPA":                   (7.0, 0.8),
        "Aptitude_Score":         (58,  8),
        "Programming_Skill":      (3.5, 1.0),
        "Data_Structures_Skill":  (3.0, 1.0),
        "Communication_Rating":   (9.0, 0.6),
        "Public_Speaking":        (7.5, 0.9),
        "Creative_Thinking":      (9.5, 0.5),
    },
    "Cloud Engineer": {
        # Moderate everything, slightly higher aptitude than Full-Stack
        "CGPA":                   (7.8, 0.7),
        "Aptitude_Score":         (78,  7),
        "Programming_Skill":      (7.0, 0.9),
        "Data_Structures_Skill":  (6.5, 1.0),
        "Communication_Rating":   (6.5, 1.0),
        "Public_Speaking":        (5.5, 1.0),
        "Creative_Thinking":      (5.5, 1.0),
    },
    "Product Manager": {
        # Highest communication + public speaking, low technical
        "CGPA":                   (7.2, 0.8),
        "Aptitude_Score":         (65,  8),
        "Programming_Skill":      (4.0, 1.0),
        "Data_Structures_Skill":  (3.5, 1.0),
        "Communication_Rating":   (9.5, 0.5),
        "Public_Speaking":        (9.0, 0.6),
        "Creative_Thinking":      (8.5, 0.7),
    },
}

FEATURE_COLS = [
    "CGPA", "Aptitude_Score", "Programming_Skill",
    "Data_Structures_Skill", "Communication_Rating",
    "Public_Speaking", "Creative_Thinking",
]

# ── Generate rows ──────────────────────────────────────────────────────────────
students_per_role = N // len(ROLES)   # ~83 per role
rows = []

for role, profile in ROLES.items():
    for _ in range(students_per_role):
        row = {}
        for feat, (mean, std) in profile.items():
            val = np.random.normal(mean, std)
            # Clip to the valid range for each feature
            if feat == "CGPA":
                val = np.clip(val, 0.0, 10.0)
            elif feat == "Aptitude_Score":
                val = np.clip(val, 1, 100)
            else:
                val = np.clip(val, 1, 10)
            row[feat] = round(val, 2) if feat in ("CGPA",) else round(val, 1)
        row["Recommended_Role"] = role
        rows.append(row)

df = pd.DataFrame(rows)

# Shuffle so roles aren't grouped — models train better on shuffled data
df = df.sample(frac=1, random_state=2024).reset_index(drop=True)

# Save raw CSV
df.to_csv(os.path.join(DATA_DIR, "student_careers.csv"), index=False)
print(f"Raw dataset saved -> student_careers.csv  ({len(df)} rows)")
print(df["Recommended_Role"].value_counts(), "\n")

# ── Preprocessing ──────────────────────────────────────────────────────────────

X = df[FEATURE_COLS].values
y = df["Recommended_Role"].values

# Encode string labels to integers (0-5) so sklearn classifiers can work with them.
# We save the encoder so app.py can reverse the integer back to a role name.
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# 80/20 stratified split — stratify=y_encoded ensures every role appears in
# both train and test sets proportionally
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=2024, stratify=y_encoded
)

# StandardScaler: transforms each feature to mean=0, std=1.
# This prevents high-range features like Aptitude_Score (1-100) from
# dominating low-range features like Programming_Skill (1-10) during training.
# We fit ONLY on training data to avoid data leakage into the test set.
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)   # apply the same transform, don't refit

# ── Persist artifacts ──────────────────────────────────────────────────────────

joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
joblib.dump(le,     os.path.join(ARTIFACTS_DIR, "label_encoder.pkl"))

# Save splits as numpy arrays so train_model.py can load them directly
np.save(os.path.join(ARTIFACTS_DIR, "X_train.npy"), X_train_scaled)
np.save(os.path.join(ARTIFACTS_DIR, "X_test.npy"),  X_test_scaled)
np.save(os.path.join(ARTIFACTS_DIR, "y_train.npy"), y_train)
np.save(os.path.join(ARTIFACTS_DIR, "y_test.npy"),  y_test)

print("Preprocessing complete.")
print(f"  Train samples : {len(X_train)}")
print(f"  Test  samples : {len(X_test)}")
print(f"  Classes       : {list(le.classes_)}")
print("\nArtifacts saved to artifacts/")
