"""
api_rest.py
===========
Pure JSON REST API consumed by the React frontend.
All routes are prefixed with /api (registered in app_factory.py).

Endpoints
---------
POST /api/auth/register        — create account
POST /api/auth/login           — get JWT access token
GET  /api/auth/me              — current user profile
POST /api/predict              — run ML prediction        [JWT required]
GET  /api/history              — all predictions          [JWT required]
GET  /api/history/<id>         — single prediction detail [JWT required]
PUT  /api/profile              — update password          [JWT required]
GET  /api/roles                — role metadata            [public]
POST /api/retrain              — re-run pipeline+training [JWT required]
GET  /api/retrain/status       — last retrain result      [JWT required]
"""

import os
import json
import subprocess
import threading
import numpy as np
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.adapters.outbound.db.models import db, User, Prediction
from backend.adapters.outbound.ml.model_service import ml_service

api_bp = Blueprint("api", __name__)

# ── Role metadata ──────────────────────────────────────────────────────────────
ROLE_META = {
    "Data Scientist": {
        "icon": "🔬", "color": "#6366f1",
        "description": "Analyse complex datasets, build predictive models, and extract actionable insights using Python, ML, and statistics.",
        "day_in_life": "Your day involves cleaning messy data, writing Python scripts to train ML models, and translating statistical findings into business strategies.",
        "salary": "₹8,00,000 – ₹25,00,000+ p.a.",
        "growth": "Data Analyst → Data Scientist → Senior Data Scientist → Lead/Principal",
        "interview": "Expect Python/SQL coding tests, probability questions, and case studies on predictive modelling.",
        "skills": ["Python / R", "Machine Learning", "SQL & NoSQL", "Data Visualisation", "Statistics"],
        "resources": [
            {"label": "Kaggle Learn",          "url": "https://www.kaggle.com/learn"},
            {"label": "fast.ai Deep Learning", "url": "https://www.fast.ai"},
            {"label": "Coursera ML Spec.",     "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
        ],
    },
    "Full-Stack Developer": {
        "icon": "💻", "color": "#0ea5e9",
        "description": "Build end-to-end web applications covering both client-side interfaces and server-side APIs.",
        "day_in_life": "You'll switch between designing interactive frontend components and architecting secure backend APIs and database queries.",
        "salary": "₹5,00,000 – ₹20,00,000+ p.a.",
        "growth": "Junior Developer → Full-Stack Developer → Senior Developer → Software Architect",
        "interview": "DSA rounds, system design questions, and a practical take-home web app assignment.",
        "skills": ["React / Vue", "Node.js / Django", "REST APIs", "Databases", "DevOps basics"],
        "resources": [
            {"label": "The Odin Project", "url": "https://www.theodinproject.com"},
            {"label": "freeCodeCamp",     "url": "https://www.freecodecamp.org"},
            {"label": "MDN Web Docs",     "url": "https://developer.mozilla.org"},
        ],
    },
    "Cyber Security Analyst": {
        "icon": "🛡️", "color": "#ef4444",
        "description": "Protect systems and networks from digital attacks, conduct vulnerability assessments, and respond to incidents.",
        "day_in_life": "Monitor network traffic for anomalies, run penetration tests, and write incident response reports.",
        "salary": "₹6,00,000 – ₹22,00,000+ p.a.",
        "growth": "Security Analyst → Penetration Tester → Security Engineer → CISO",
        "interview": "Network protocols, encryption standards, OWASP Top 10, and incident response scenarios.",
        "skills": ["Network Security", "Ethical Hacking", "SIEM Tools", "Python Scripting", "Risk Assessment"],
        "resources": [
            {"label": "TryHackMe",         "url": "https://tryhackme.com"},
            {"label": "Hack The Box",      "url": "https://www.hackthebox.com"},
            {"label": "CompTIA Security+", "url": "https://www.comptia.org/certifications/security"},
        ],
    },
    "UI/UX Designer": {
        "icon": "🎨", "color": "#f59e0b",
        "description": "Design intuitive, accessible, and visually compelling digital experiences through research and prototyping.",
        "day_in_life": "Conduct user interviews, sketch wireframes, create high-fidelity Figma prototypes, and hand off to developers.",
        "salary": "₹4,50,000 – ₹18,00,000+ p.a.",
        "growth": "Junior Designer → UI/UX Designer → Lead Designer → Product Design Director",
        "interview": "Portfolio walkthrough, design process explanation, and a whiteboard design challenge.",
        "skills": ["Figma / Adobe XD", "User Research", "Wireframing", "Prototyping", "Accessibility"],
        "resources": [
            {"label": "Google UX Design Cert.", "url": "https://grow.google/certificates/ux-design/"},
            {"label": "Figma Community",        "url": "https://www.figma.com/community"},
            {"label": "Nielsen Norman Group",   "url": "https://www.nngroup.com/articles/"},
        ],
    },
    "Cloud Engineer": {
        "icon": "☁️", "color": "#10b981",
        "description": "Design, deploy, and manage scalable cloud infrastructure on AWS, Azure, or GCP.",
        "day_in_life": "Write Terraform IaC to provision servers, configure Kubernetes clusters, and optimise CI/CD pipelines.",
        "salary": "₹7,00,000 – ₹25,00,000+ p.a.",
        "growth": "Cloud Administrator → Cloud Engineer → Cloud Architect",
        "interview": "Linux, networking, Docker/Kubernetes, and highly-available architecture design scenarios.",
        "skills": ["AWS / Azure / GCP", "Terraform / IaC", "Kubernetes", "CI/CD Pipelines", "Linux"],
        "resources": [
            {"label": "AWS Free Tier",       "url": "https://aws.amazon.com/free/"},
            {"label": "Google Cloud Skills", "url": "https://cloudskillsboost.google"},
            {"label": "A Cloud Guru",        "url": "https://acloudguru.com"},
        ],
    },
    "Product Manager": {
        "icon": "📋", "color": "#8b5cf6",
        "description": "Define product vision, prioritise features, and coordinate cross-functional teams to ship impactful products.",
        "day_in_life": "Run standups, review usage metrics, talk to customers, and write feature specification documents.",
        "salary": "₹8,00,000 – ₹30,00,000+ p.a.",
        "growth": "Associate PM → Product Manager → Group PM → VP of Product",
        "interview": "Product sense questions, prioritisation frameworks, and stakeholder management scenarios.",
        "skills": ["Roadmapping", "Agile / Scrum", "Data Analysis", "Stakeholder Mgmt", "User Stories"],
        "resources": [
            {"label": "Product School",     "url": "https://productschool.com/free-product-management-resources/"},
            {"label": "Lenny's Newsletter", "url": "https://www.lennysnewsletter.com"},
            {"label": "Mind the Product",   "url": "https://www.mindtheproduct.com"},
        ],
    },
}

# Load cached market insights
_market: dict = {}
try:
    _insights_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "data", "market_insights.json"
    )
    with open(_insights_path, "r", encoding="utf-8") as f:
        _market = json.load(f)
except FileNotFoundError:
    pass

def _build_role_meta(role: str) -> dict:
    meta = ROLE_META.get(role, {}).copy()
    meta.update(_market.get(role, {}))
    return meta

# ── Retrain state (in-memory, single-process) ──────────────────────────────────
_retrain_state = {
    "status":    "idle",      # idle | running | success | error
    "message":   "",
    "accuracy":  None,
    "started_at": None,
    "finished_at": None,
}
_retrain_lock = threading.Lock()

def _run_retrain():
    """
    Runs data_pipeline.py then train_model.py in a background thread.
    Updates _retrain_state so the frontend can poll /api/retrain/status.
    """
    global _retrain_state
    base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    pipeline_script = os.path.join(base, "ml_old", "data_pipeline.py")
    train_script    = os.path.join(base, "ml_old", "train_model.py")

    import sys
    python = sys.executable   # use the same interpreter Flask is running under

    try:
        # Step 1 — regenerate dataset and preprocessing artifacts
        r1 = subprocess.run(
            [python, pipeline_script],
            capture_output=True, text=True, timeout=120
        )
        if r1.returncode != 0:
            raise RuntimeError(f"data_pipeline.py failed:\n{r1.stderr}")

        # Step 2 — retrain the model
        r2 = subprocess.run(
            [python, train_script],
            capture_output=True, text=True, timeout=300
        )
        if r2.returncode != 0:
            raise RuntimeError(f"train_model.py failed:\n{r2.stderr}")

        # Parse accuracy from stdout (line like "Best model : Random Forest  (87.00% accuracy)")
        accuracy = None
        for line in r2.stdout.splitlines():
            if "Best model" in line and "%" in line:
                try:
                    accuracy = float(line.split("(")[1].split("%")[0].strip())
                except Exception:
                    pass

        # Hot-reload the model service so new predictions use the fresh model
        ml_service.reload()

        with _retrain_lock:
            _retrain_state.update({
                "status":      "success",
                "message":     "Retraining complete. Model reloaded.",
                "accuracy":    accuracy,
                "finished_at": datetime.utcnow().isoformat(),
            })

    except Exception as exc:
        with _retrain_lock:
            _retrain_state.update({
                "status":      "error",
                "message":     str(exc),
                "finished_at": datetime.utcnow().isoformat(),
            })

# ── Helpers ────────────────────────────────────────────────────────────────────

def _prediction_to_dict(p: Prediction) -> dict:
    return {
        "id":               p.id,
        "predicted_role":   p.predicted_role,
        "cgpa":             p.cgpa,
        "aptitude":         p.aptitude_score,
        "programming":      p.programming,
        "data_structures":  p.data_structures,
        "communication":    p.communication,
        "public_speaking":  p.public_speaking,
        "creative_thinking":p.creative_thinking,
        "created_at":       p.created_at.isoformat(),
    }

def _user_to_dict(u: User) -> dict:
    return {
        "id":               u.id,
        "username":         u.username,
        "email":            u.email,
        "cgpa":             u.cgpa,
        "aptitude":         u.aptitude_score,
        "programming":      u.programming,
        "data_structures":  u.data_structures,
        "communication":    u.communication,
        "public_speaking":  u.public_speaking,
        "creative_thinking":u.creative_thinking,
        "created_at":       u.created_at.isoformat(),
    }

# ── Auth routes ────────────────────────────────────────────────────────────────

@api_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    username = str(data.get("username", "")).strip()
    email    = str(data.get("email",    "")).strip().lower()
    password = str(data.get("password", "")).strip()
    confirm  = str(data.get("confirm",  "")).strip()

    cgpa        = float(data.get("cgpa",             7.0))
    aptitude    = int(  data.get("aptitude",          60))
    programming = float(data.get("programming",       5.0))
    ds_skill    = float(data.get("data_structures",   5.0))
    comm        = float(data.get("communication",     5.0))
    speaking    = float(data.get("public_speaking",   5.0))
    creative    = float(data.get("creative_thinking", 5.0))

    if not all([username, email, password, confirm]):
        return jsonify({"error": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if password != confirm:
        return jsonify({"error": "Passwords do not match."}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    user = User(
        username=username, email=email,
        cgpa=cgpa, aptitude_score=aptitude,
        programming=programming, data_structures=ds_skill,
        communication=comm, public_speaking=speaking,
        creative_thinking=creative,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_to_dict(user)}), 201


@api_bp.route("/auth/login", methods=["POST"])
def login():
    data       = request.get_json(silent=True) or {}
    identifier = str(data.get("identifier", "")).strip()
    password   = str(data.get("password",   "")).strip()

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": _user_to_dict(user)}), 200


@api_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify({"user": _user_to_dict(user)}), 200

# ── Prediction ─────────────────────────────────────────────────────────────────

@api_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    user    = User.query.get_or_404(user_id)
    data    = request.get_json(silent=True) or {}
    mode    = data.get("mode", "custom")

    if mode == "quick":
        cgpa, aptitude   = user.cgpa, user.aptitude_score
        programming      = user.programming
        ds_skill, comm   = user.data_structures, user.communication
        speaking, creative = user.public_speaking, user.creative_thinking
    else:
        try:
            cgpa        = float(data["cgpa"])
            aptitude    = float(data["aptitude"])
            programming = float(data["programming"])
            ds_skill    = float(data["data_structures"])
            comm        = float(data["communication"])
            speaking    = float(data["public_speaking"])
            creative    = float(data["creative_thinking"])
        except (KeyError, ValueError, TypeError):
            return jsonify({"error": "Invalid or missing input fields."}), 400

        cgpa        = max(0.0, min(10.0, cgpa))
        aptitude    = max(1,   min(100,  int(aptitude)))
        programming = max(1.0, min(10.0, programming))
        ds_skill    = max(1.0, min(10.0, ds_skill))
        comm        = max(1.0, min(10.0, comm))
        speaking    = max(1.0, min(10.0, speaking))
        creative    = max(1.0, min(10.0, creative))

        user.cgpa = cgpa; user.aptitude_score = int(aptitude)
        user.programming = programming; user.data_structures = ds_skill
        user.communication = comm; user.public_speaking = speaking
        user.creative_thinking = creative
        db.session.commit()

    features = np.array([[cgpa, aptitude, programming, ds_skill, comm, speaking, creative]])

    try:
        predicted_role, role_scores = ml_service.predict(features)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 503

    sorted_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)
    alt_role  = sorted_roles[1][0] if len(sorted_roles) > 1 else None
    alt_score = sorted_roles[1][1] if len(sorted_roles) > 1 else None

    record = Prediction(
        user_id=user_id, cgpa=cgpa, aptitude_score=int(aptitude),
        programming=programming, data_structures=ds_skill,
        communication=comm, public_speaking=speaking,
        creative_thinking=creative, predicted_role=predicted_role,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "prediction_id":  record.id,
        "predicted_role": predicted_role,
        "role_meta":      _build_role_meta(predicted_role),
        "alt_role":       alt_role,
        "alt_score":      alt_score,
        "alt_meta":       _build_role_meta(alt_role) if alt_role else {},
        "role_scores":    role_scores,
        "inputs": {
            "cgpa": cgpa, "aptitude": int(aptitude),
            "programming": programming, "data_structures": ds_skill,
            "communication": comm, "public_speaking": speaking,
            "creative_thinking": creative,
        },
    }), 200

# ── History ────────────────────────────────────────────────────────────────────

@api_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    from sqlalchemy import func
    user_id = int(get_jwt_identity())

    predictions = (
        Prediction.query
        .filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    role_dist = (
        db.session.query(Prediction.predicted_role, func.count(Prediction.id))
        .filter_by(user_id=user_id)
        .group_by(Prediction.predicted_role)
        .all()
    )

    avg_fields = [
        func.avg(Prediction.cgpa),          func.avg(Prediction.aptitude_score),
        func.avg(Prediction.programming),   func.avg(Prediction.data_structures),
        func.avg(Prediction.communication), func.avg(Prediction.public_speaking),
        func.avg(Prediction.creative_thinking),
    ]
    avgs = db.session.query(*avg_fields).filter_by(user_id=user_id).one()
    avg_cgpa, avg_apt, avg_prog, avg_ds, avg_comm, avg_speak, avg_creative = (
        (v or 0) for v in avgs
    )

    return jsonify({
        "predictions": [_prediction_to_dict(p) for p in predictions],
        "total":       len(predictions),
        "role_dist":   [{"role": r, "count": c} for r, c in role_dist],
        "avg_scores": {
            "cgpa": round(avg_cgpa, 2),       "aptitude": round(avg_apt, 1),
            "programming": round(avg_prog, 2), "data_structures": round(avg_ds, 2),
            "communication": round(avg_comm, 2), "public_speaking": round(avg_speak, 2),
            "creative_thinking": round(avg_creative, 2),
        },
    }), 200


@api_bp.route("/history/<int:pred_id>", methods=["GET"])
@jwt_required()
def history_detail(pred_id):
    user_id = int(get_jwt_identity())
    p = Prediction.query.filter_by(id=pred_id, user_id=user_id).first_or_404()

    features = np.array([[
        p.cgpa, p.aptitude_score, p.programming,
        p.data_structures, p.communication,
        p.public_speaking, p.creative_thinking,
    ]])

    try:
        predicted_role, role_scores = ml_service.predict(features)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 503

    sorted_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)
    alt_role  = sorted_roles[1][0] if len(sorted_roles) > 1 else None
    alt_score = sorted_roles[1][1] if len(sorted_roles) > 1 else None

    return jsonify({
        **_prediction_to_dict(p),
        "predicted_role": predicted_role,
        "role_meta":      _build_role_meta(predicted_role),
        "alt_role":       alt_role,
        "alt_score":      alt_score,
        "alt_meta":       _build_role_meta(alt_role) if alt_role else {},
        "role_scores":    role_scores,
        "inputs": {
            "cgpa": p.cgpa,
            "aptitude": p.aptitude_score,
            "programming": p.programming,
            "data_structures": p.data_structures,
            "communication": p.communication,
            "public_speaking": p.public_speaking,
            "creative_thinking": p.creative_thinking,
        },
    }), 200

# ── Profile ────────────────────────────────────────────────────────────────────

@api_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = User.query.get_or_404(int(get_jwt_identity()))
    data = request.get_json(silent=True) or {}

    # If password fields are present, treat this as a password update
    if any(k in data for k in ("current_password", "new_password", "confirm_password")):
        current = str(data.get("current_password", "")).strip()
        new_pw  = str(data.get("new_password",     "")).strip()
        confirm = str(data.get("confirm_password", "")).strip()

        if not all([current, new_pw, confirm]):
            return jsonify({"error": "All password fields are required."}), 400
        if not user.check_password(current):
            return jsonify({"error": "Incorrect current password."}), 401
        if len(new_pw) < 6:
            return jsonify({"error": "New password must be at least 6 characters."}), 400
        if new_pw != confirm:
            return jsonify({"error": "New passwords do not match."}), 400

        user.set_password(new_pw)
        db.session.commit()
        return jsonify({"message": "Password updated successfully."}), 200

    # Otherwise treat as profile update (username/email/skills)
    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()

    if not username or not email:
        return jsonify({"error": "Username and email are required."}), 400

    # Check uniqueness only when the value is changing
    if username != user.username and User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 409
    if email != user.email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    # Parse and validate numeric skill fields
    try:
        cgpa = float(data.get("cgpa", user.cgpa or 7.0))
        aptitude = int(data.get("aptitude", user.aptitude_score or 60))
        programming = float(data.get("programming", user.programming or 5.0))
        ds_skill = float(data.get("data_structures", user.data_structures or 5.0))
        comm = float(data.get("communication", user.communication or 5.0))
        speaking = float(data.get("public_speaking", user.public_speaking or 5.0))
        creative = float(data.get("creative_thinking", user.creative_thinking or 5.0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid input for numeric fields."}), 400

    # Clamp values to sensible ranges
    cgpa = max(0.0, min(10.0, cgpa))
    aptitude = max(1, min(100, aptitude))
    programming = max(1.0, min(10.0, programming))
    ds_skill = max(1.0, min(10.0, ds_skill))
    comm = max(1.0, min(10.0, comm))
    speaking = max(1.0, min(10.0, speaking))
    creative = max(1.0, min(10.0, creative))

    # Apply changes
    user.username = username
    user.email = email
    user.cgpa = cgpa
    user.aptitude_score = int(aptitude)
    user.programming = programming
    user.data_structures = ds_skill
    user.communication = comm
    user.public_speaking = speaking
    user.creative_thinking = creative

    db.session.commit()
    return jsonify({"message": "Profile updated successfully.", "user": _user_to_dict(user)}), 200

# ── Public roles ───────────────────────────────────────────────────────────────

@api_bp.route("/roles", methods=["GET"])
def roles():
    return jsonify({"roles": ROLE_META}), 200

# ── Retrain ────────────────────────────────────────────────────────────────────

@api_bp.route("/retrain", methods=["POST"])
@jwt_required()
def retrain():
    """
    Kicks off data_pipeline.py + train_model.py in a background thread,
    then hot-reloads the model service. Returns immediately with status=running.
    """
    global _retrain_state

    with _retrain_lock:
        if _retrain_state["status"] == "running":
            return jsonify({"error": "Retraining already in progress."}), 409

        _retrain_state = {
            "status":      "running",
            "message":     "Starting pipeline and training…",
            "accuracy":    None,
            "started_at":  datetime.utcnow().isoformat(),
            "finished_at": None,
        }

    thread = threading.Thread(target=_run_retrain, daemon=True)
    thread.start()

    return jsonify({"message": "Retraining started.", "status": "running"}), 202


@api_bp.route("/retrain/status", methods=["GET"])
@jwt_required()
def retrain_status():
    with _retrain_lock:
        return jsonify(_retrain_state), 200
