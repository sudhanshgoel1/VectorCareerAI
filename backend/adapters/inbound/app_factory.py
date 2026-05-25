import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.adapters.outbound.db.models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object("backend.config.Config")

    app.instance_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "instance"
    )
    os.makedirs(app.instance_path, exist_ok=True)

    # Explicitly allow Authorization header so JWT tokens pass through
    # CORS preflight checks from the React dev server (port 5173).
    # Without allow_headers, the browser's OPTIONS preflight will succeed
    # but the actual POST will have its Authorization header stripped,
    # causing Flask-JWT-Extended to return 422.
    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }},
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    JWTManager(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    from backend.adapters.inbound.api_rest import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
