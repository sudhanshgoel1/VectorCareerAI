import os
import json
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from functools import wraps
import numpy as np
from backend.adapters.outbound.db.models import db, User, Prediction
from backend.adapters.outbound.ml.model_service import ml_service

main_bp = Blueprint('main', __name__)

# Load real-world market insights
market_insights = {}
try:
    insights_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "market_insights.json")
    with open(insights_path, "r", encoding="utf-8") as f:
        market_insights = json.load(f)
except FileNotFoundError:
    print(f"[WARNING] {insights_path} not found. Run ml/fetch_market_data.py first.")

# ── Role metadata: icons, colors, and learning resources ──────────────────────
ROLE_META = {
    "Data Scientist": {
        "icon": "🔬",
        "color": "#6366f1",
        "description": "Analyse complex datasets, build predictive models, and extract actionable insights using Python, ML, and statistics.",
        "day_in_life": "Your day involves cleaning messy data, writing Python scripts to train machine learning models, and translating statistical findings into business strategies for stakeholders.",
        "salary": "₹8,00,000 - ₹25,00,000+ p.a.",
        "growth": "Data Analyst → Data Scientist → Senior Data Scientist → Lead/Principal Data Scientist",
        "interview": "Expect coding tests in Python/SQL, probability/statistics questions, and case studies on how you would approach a specific predictive modeling problem.",
        "skills": ["Python / R", "Machine Learning", "SQL & NoSQL", "Data Visualisation", "Statistics"],
        "resources": [
            {"label": "Kaggle Learn",          "url": "https://www.kaggle.com/learn"},
            {"label": "fast.ai Deep Learning", "url": "https://www.fast.ai"},
            {"label": "Coursera ML Spec.",     "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
        ],
    },
    "Full-Stack Developer": {
        "icon": "💻",
        "color": "#0ea5e9",
        "description": "Build end-to-end web applications covering both client-side interfaces and server-side APIs.",
        "day_in_life": "You'll be switching between designing interactive frontend UI components and architecting secure backend APIs and database queries.",
        "salary": "₹5,00,000 - ₹20,00,000+ p.a.",
        "growth": "Junior Developer → Full-Stack Developer → Senior Developer → Software Architect",
        "interview": "You will face Data Structures & Algorithms (DSA) rounds, system design questions, and likely a practical take-home web app assignment.",
        "skills": ["React / Vue", "Node.js / Django", "REST APIs", "Databases", "DevOps basics"],
        "resources": [
            {"label": "The Odin Project",  "url": "https://www.theodinproject.com"},
            {"label": "freeCodeCamp",      "url": "https://www.freecodecamp.org"},
            {"label": "MDN Web Docs",      "url": "https://developer.mozilla.org"},
        ],
    },
    "Cyber Security Analyst": {
        "icon": "🛡️",
        "color": "#ef4444",
        "description": "Protect systems and networks from digital attacks, conduct vulnerability assessments, and respond to incidents.",
        "day_in_life": "You'll monitor network traffic for anomalies, run penetration tests to find vulnerabilities, and write reports on how to secure the company's infrastructure.",
        "salary": "₹6,00,000 - ₹22,00,000+ p.a.",
        "growth": "Security Analyst → Penetration Tester / Security Engineer → CISO",
        "interview": "Be prepared for questions on network protocols, encryption standards, common web vulnerabilities (OWASP Top 10), and incident response scenarios.",
        "skills": ["Network Security", "Ethical Hacking", "SIEM Tools", "Python Scripting", "Risk Assessment"],
        "resources": [
            {"label": "TryHackMe",          "url": "https://tryhackme.com"},
            {"label": "Hack The Box",       "url": "https://www.hackthebox.com"},
            {"label": "CompTIA Security+",  "url": "https://www.comptia.org/certifications/security"},
        ],
    },
    "UI/UX Designer": {
        "icon": "🎨",
        "color": "#f59e0b",
        "description": "Design intuitive, accessible, and visually compelling digital experiences through research and prototyping.",
        "day_in_life": "You will conduct user interviews, sketch wireframes, create high-fidelity interactive prototypes in Figma, and hand off designs to developers.",
        "salary": "₹4,50,000 - ₹18,00,000+ p.a.",
        "growth": "Junior Designer → UI/UX Designer → Lead Designer → Product Design Director",
        "interview": "Your portfolio is your biggest asset. You'll be asked to walk through your design process (from research to final prototype) and may face a whiteboard design challenge.",
        "skills": ["Figma / Adobe XD", "User Research", "Wireframing", "Prototyping", "Accessibility"],
        "resources": [
            {"label": "Google UX Design Cert.", "url": "https://grow.google/certificates/ux-design/"},
            {"label": "Figma Community",        "url": "https://www.figma.com/community"},
            {"label": "Nielsen Norman Group",   "url": "https://www.nngroup.com/articles/"},
        ],
    },
    "Cloud Engineer": {
        "icon": "☁️",
        "color": "#10b981",
        "description": "Design, deploy, and manage scalable cloud infrastructure on platforms like AWS, Azure, or GCP.",
        "day_in_life": "You'll write Infrastructure as Code (Terraform) to provision servers, configure Kubernetes clusters, and optimize CI/CD pipelines to ensure software is deployed reliably.",
        "salary": "₹7,00,000 - ₹25,00,000+ p.a.",
        "growth": "Cloud Administrator → Cloud Engineer → Cloud Architect",
        "interview": "Expect deep questions on Linux, networking, containerization (Docker/Kubernetes), and scenario-based questions on how to design a highly-available cloud architecture.",
        "skills": ["AWS / Azure / GCP", "Terraform / IaC", "Kubernetes", "CI/CD Pipelines", "Linux"],
        "resources": [
            {"label": "AWS Free Tier",          "url": "https://aws.amazon.com/free/"},
            {"label": "Google Cloud Skills",    "url": "https://cloudskillsboost.google"},
            {"label": "A Cloud Guru",           "url": "https://acloudguru.com"},
        ],
    },
    "Product Manager": {
        "icon": "📋",
        "color": "#8b5cf6",
        "description": "Define product vision, prioritise features, and coordinate cross-functional teams to ship impactful products.",
        "day_in_life": "You'll attend standups with engineers, review usage metrics, talk to customers to gather feedback, and write specification documents for new features.",
        "salary": "₹8,00,000 - ₹30,00,000+ p.a.",
        "growth": "Associate PM → Product Manager → Group Product Manager → VP of Product",
        "interview": "Interviews focus on product sense (e.g., 'How would you improve Google Maps?'), prioritization frameworks, and your ability to work with difficult stakeholders.",
        "skills": ["Roadmapping", "Agile / Scrum", "Data Analysis", "Stakeholder Mgmt", "User Stories"],
        "resources": [
            {"label": "Product School",         "url": "https://productschool.com/free-product-management-resources/"},
            {"label": "Lenny's Newsletter",     "url": "https://www.lennysnewsletter.com"},
            {"label": "Mind the Product",       "url": "https://www.mindtheproduct.com"},
        ],
    },
}

# ── Auth decorator ─────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access that page.", "warning")
            return redirect(url_for("main.login"))
        return f(*args, **kwargs)
    return decorated

# ── Routes ─────────────────────────────────────────────────────────────────────

@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("main.prediction"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email    = request.form.get("email",    "").strip().lower()
        password = request.form.get("password", "").strip()
        confirm  = request.form.get("confirm",  "").strip()

        if not all([username, email, password, confirm]):
            flash("All fields are required.", "danger")
            return render_template("register.html")

        if len(password) < 6:
            flash("Password must be at least 6 characters.", "danger")
            return render_template("register.html")

        if password != confirm:
            flash("Passwords do not match.", "danger")
            return render_template("register.html")

        if User.query.filter_by(username=username).first():
            flash("That username is already taken.", "danger")
            return render_template("register.html")

        if User.query.filter_by(email=email).first():
            flash("An account with that email already exists.", "danger")
            return render_template("register.html")

        # Extract Profile Fields
        cgpa        = request.form.get("cgpa", 7.0)
        aptitude    = request.form.get("aptitude", 60)
        programming = request.form.get("programming", 5.0)
        ds_skill    = request.form.get("data_structures", 5.0)
        comm        = request.form.get("communication", 5.0)
        speaking    = request.form.get("public_speaking", 5.0)
        creative    = request.form.get("creative_thinking", 5.0)

        # pyrefly: ignore [unexpected-keyword]
        user = User(
            username=username, 
            email=email,
            cgpa=float(cgpa),
            aptitude_score=int(aptitude),
            programming=float(programming),
            data_structures=float(ds_skill),
            communication=float(comm),
            public_speaking=float(speaking),
            creative_thinking=float(creative)
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("Account created successfully! Please log in.", "success")
        return redirect(url_for("main.login"))

    return render_template("register.html")


@main_bp.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("main.prediction"))

    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip()
        password = request.form.get("password", "").strip()

        # Check if user exists by username OR email
        user = User.query.filter((User.username == identifier) | (User.email == identifier.lower())).first()

        if not user or not user.check_password(password):
            flash("Invalid username or password.", "danger")
            return render_template("login.html")

        session["user_id"]  = user.id
        session["username"] = user.username
        flash(f"Welcome back, {user.username}!", "success")
        return redirect(url_for("main.prediction"))

    return render_template("login.html")


@main_bp.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("main.index"))


@main_bp.route("/prediction")
@login_required
def prediction():
    recent = (
        Prediction.query
        .filter_by(user_id=session["user_id"])
        .order_by(Prediction.created_at.desc())
        .limit(5)
        .all()
    )
    user = User.query.get(session["user_id"])
    return render_template("prediction.html", username=session["username"], recent=recent, user=user)


@main_bp.route("/predict", methods=["POST"])
@login_required
def predict():
    mode = request.form.get("mode", "quick")
    user = User.query.get(session["user_id"])

    if mode == "quick" and user:
        cgpa        = user.cgpa
        aptitude    = user.aptitude_score
        programming = user.programming
        ds_skill    = user.data_structures
        comm        = user.communication
        speaking    = user.public_speaking
        creative    = user.creative_thinking
    else:
        try:
            cgpa        = float(request.form["cgpa"])
            aptitude    = float(request.form["aptitude"])
            programming = float(request.form["programming"])
            ds_skill    = float(request.form["data_structures"])
            comm        = float(request.form["communication"])
            speaking    = float(request.form["public_speaking"])
            creative    = float(request.form["creative_thinking"])

            cgpa        = max(0.0, min(10.0, cgpa))
            aptitude    = max(1,   min(100,  aptitude))
            programming = max(1.0, min(10.0, programming))
            ds_skill    = max(1.0, min(10.0, ds_skill))
            comm        = max(1.0, min(10.0, comm))
            speaking    = max(1.0, min(10.0, speaking))
            creative    = max(1.0, min(10.0, creative))
            
            # Update the user's default profile with these new values
            if user:
                user.cgpa = cgpa
                user.aptitude_score = int(aptitude)
                user.programming = programming
                user.data_structures = ds_skill
                user.communication = comm
                user.public_speaking = speaking
                user.creative_thinking = creative
                db.session.commit()
                
        except (KeyError, ValueError):
            flash("Invalid input values. Please use the form controls.", "danger")
            return redirect(url_for("main.prediction"))

    raw_features = np.array([[cgpa, aptitude, programming, ds_skill, comm, speaking, creative]])

    try:
        predicted_role, role_scores = ml_service.predict(raw_features)
    except ValueError as e:
        flash("ML model not loaded. Run data_pipeline.py and train_model.py first.", "danger")
        return redirect(url_for("main.prediction"))
        
    # Calculate Alternative Path (2nd highest score)
    sorted_roles = sorted(role_scores.items(), key=lambda item: item[1], reverse=True)
    alt_role = sorted_roles[1][0] if len(sorted_roles) > 1 else None
    alt_score = sorted_roles[1][1] if len(sorted_roles) > 1 else None
    
    # Get Market Data
    role_info = ROLE_META.get(predicted_role, {})
    market_data = market_insights.get(predicted_role, {})
    
    # Merge them into a single dictionary for the template
    combined_info = role_info.copy()
    combined_info.update(market_data)

    pred_record = Prediction(
        # pyrefly: ignore [unexpected-keyword]
        user_id=session["user_id"],
        # pyrefly: ignore [unexpected-keyword]
        cgpa=cgpa, aptitude_score=int(aptitude),
        # pyrefly: ignore [unexpected-keyword]
        programming=programming, data_structures=ds_skill,
        # pyrefly: ignore [unexpected-keyword]
        communication=comm, public_speaking=speaking,
        # pyrefly: ignore [unexpected-keyword]
        creative_thinking=creative, predicted_role=predicted_role,
    )
    db.session.add(pred_record)
    db.session.commit()

    return render_template(
        "results.html",
        username=session["username"],
        predicted_role=predicted_role,
        role_meta=combined_info,
        alt_role=alt_role,
        alt_score=alt_score,
        alt_meta=ROLE_META.get(alt_role, {}),
        role_scores=role_scores,
        roles_json=json.dumps(list(role_scores.keys())),
        scores_json=json.dumps(list(role_scores.values())),
        radar_labels=json.dumps(["CGPA×10", "Aptitude", "Programming×10",
                                  "Data Struct×10", "Communication×10",
                                  "Public Speaking×10", "Creative×10"]),
        radar_data=json.dumps([
            round(cgpa * 10, 1), round(aptitude, 1),
            round(programming * 10, 1), round(ds_skill * 10, 1),
            round(comm * 10, 1), round(speaking * 10, 1),
            round(creative * 10, 1),
        ]),
        inputs=dict(
            cgpa=cgpa, aptitude=int(aptitude),
            programming=programming, data_structures=ds_skill,
            communication=comm, public_speaking=speaking,
            creative_thinking=creative,
        ),
    )


@main_bp.route("/history")
@login_required
def history():
    from sqlalchemy import func
    user_id = session["user_id"]
    
    all_preds = (
        Prediction.query
        .filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    
    # Calculate Personal Analytics
    total_preds = len(all_preds)
    
    role_dist = db.session.query(
        Prediction.predicted_role, 
        func.count(Prediction.id)
    ).filter_by(user_id=user_id).group_by(Prediction.predicted_role).all()
    
    role_labels = json.dumps([r[0] for r in role_dist])
    role_counts = json.dumps([r[1] for r in role_dist])
    
    if total_preds > 0:
        avg_cgpa = db.session.query(func.avg(Prediction.cgpa)).filter_by(user_id=user_id).scalar() or 0
        avg_aptitude = db.session.query(func.avg(Prediction.aptitude_score)).filter_by(user_id=user_id).scalar() or 0
        avg_prog = db.session.query(func.avg(Prediction.programming)).filter_by(user_id=user_id).scalar() or 0
        avg_ds = db.session.query(func.avg(Prediction.data_structures)).filter_by(user_id=user_id).scalar() or 0
        avg_comm = db.session.query(func.avg(Prediction.communication)).filter_by(user_id=user_id).scalar() or 0
        avg_speak = db.session.query(func.avg(Prediction.public_speaking)).filter_by(user_id=user_id).scalar() or 0
        avg_creative = db.session.query(func.avg(Prediction.creative_thinking)).filter_by(user_id=user_id).scalar() or 0
    else:
        avg_cgpa = avg_aptitude = avg_prog = avg_ds = avg_comm = avg_speak = avg_creative = 0
        
    avg_data = json.dumps([
        round(avg_cgpa * 10, 1), round(avg_aptitude, 1), round(avg_prog * 10, 1),
        round(avg_ds * 10, 1), round(avg_comm * 10, 1), round(avg_speak * 10, 1),
        round(avg_creative * 10, 1)
    ])

    return render_template(
        "history.html", 
        username=session["username"], 
        predictions=all_preds,
        total_preds=total_preds,
        role_labels=role_labels,
        role_counts=role_counts,
        avg_data=avg_data
    )


@main_bp.route("/history/<int:pred_id>")
@login_required
def history_detail(pred_id):
    pred_record = Prediction.query.filter_by(id=pred_id, user_id=session["user_id"]).first_or_404()
    
    # Reconstruct raw features for prediction
    raw_features = np.array([[
        pred_record.cgpa,
        pred_record.aptitude_score,
        pred_record.programming,
        pred_record.data_structures,
        pred_record.communication,
        pred_record.public_speaking,
        pred_record.creative_thinking
    ]])
    
    try:
        predicted_role, role_scores = ml_service.predict(raw_features)
    except ValueError:
        flash("Error re-calculating report scores.", "danger")
        return redirect(url_for("main.history"))
        
    # Calculate Alternative Path (2nd highest score)
    sorted_roles = sorted(role_scores.items(), key=lambda item: item[1], reverse=True)
    alt_role = sorted_roles[1][0] if len(sorted_roles) > 1 else None
    alt_score = sorted_roles[1][1] if len(sorted_roles) > 1 else None

    # Chart inputs
    inputs = {
        "cgpa": pred_record.cgpa,
        "aptitude": pred_record.aptitude_score,
        "programming": pred_record.programming,
        "data_structures": pred_record.data_structures,
        "communication": pred_record.communication,
        "public_speaking": pred_record.public_speaking,
        "creative_thinking": pred_record.creative_thinking
    }
    
    radar_labels = json.dumps(["CGPA", "Aptitude", "Programming", "Data Struct.", "Communication", "Public Speaking", "Creative"])
    radar_data = json.dumps([
        pred_record.cgpa * 10,
        pred_record.aptitude_score,
        pred_record.programming * 10,
        pred_record.data_structures * 10,
        pred_record.communication * 10,
        pred_record.public_speaking * 10,
        pred_record.creative_thinking * 10
    ])
    
    return render_template(
        "results.html",
        username=session["username"],
        predicted_role=predicted_role,
        role_meta=ROLE_META.get(predicted_role, {}),
        alt_role=alt_role,
        alt_score=alt_score,
        alt_meta=ROLE_META.get(alt_role, {}),
        role_scores=role_scores,
        roles_json=json.dumps(list(role_scores.keys())),
        scores_json=json.dumps(list(role_scores.values())),
        radar_labels=radar_labels,
        radar_data=radar_data,
        inputs=inputs
    )


@main_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    user = User.query.get(session["user_id"])
    
    if request.method == "POST":
        current_password = request.form.get("current_password", "").strip()
        new_password = request.form.get("new_password", "").strip()
        confirm_password = request.form.get("confirm_password", "").strip()
        
        if not all([current_password, new_password, confirm_password]):
            flash("All password fields are required.", "danger")
        elif not user.check_password(current_password):
            flash("Incorrect current password.", "danger")
        elif len(new_password) < 6:
            flash("New password must be at least 6 characters.", "danger")
        elif new_password != confirm_password:
            flash("New passwords do not match.", "danger")
        else:
            user.set_password(new_password)
            db.session.commit()
            flash("Password updated successfully!", "success")
            return redirect(url_for("main.profile"))
            
    return render_template("profile.html", user=user)
