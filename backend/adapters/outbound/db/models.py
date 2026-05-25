"""
models.py
=========
SQLAlchemy ORM models for the Career Recommendation System.
Kept in a separate file so app.py stays clean and models can be
imported independently (e.g., for database migrations or tests).
"""

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    """
    Represents a registered student.

    password_hash stores a bcrypt/pbkdf2 digest — never the plain-text
    password. werkzeug.security handles the hashing algorithm selection
    automatically, so we don't need to manage salt rounds manually.
    """
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80),  unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    # Profile / Skill columns (defaults set at signup)
    cgpa              = db.Column(db.Float,   default=7.0)
    aptitude_score    = db.Column(db.Integer, default=60)
    programming       = db.Column(db.Float,   default=5.0)
    data_structures   = db.Column(db.Float,   default=5.0)
    communication     = db.Column(db.Float,   default=5.0)
    public_speaking   = db.Column(db.Float,   default=5.0)
    creative_thinking = db.Column(db.Float,   default=5.0)

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # One user can have many prediction records
    predictions   = db.relationship("Prediction", backref="user", lazy=True)

    def set_password(self, password: str) -> None:
        """Hash and store the password. Never call this with an already-hashed value."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Return True if the plain-text password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"


class Prediction(db.Model):
    """
    Stores each career prediction made by a student so they can review
    their history on the prediction.
    """
    __tablename__ = "predictions"

    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cgpa              = db.Column(db.Float,   nullable=False)
    aptitude_score    = db.Column(db.Integer, nullable=False)
    programming       = db.Column(db.Float,   nullable=False)
    data_structures   = db.Column(db.Float,   nullable=False)
    communication     = db.Column(db.Float,   nullable=False)
    public_speaking   = db.Column(db.Float,   nullable=False)
    creative_thinking = db.Column(db.Float,   nullable=False)
    predicted_role    = db.Column(db.String(100), nullable=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Prediction {self.predicted_role} for user {self.user_id}>"
