import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "vectorcareer-ai-dev-key-2025")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "vectorcareer-ai-jwt-secret-key-2025!!")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
