# VectorCareer AI 🚀

A modern AI-powered career guidance web app that predicts the best-fit tech role for a student based on academics, soft skills, and market signals.

## ✨ What this project includes

- **AI-powered career prediction** from a student profile
- **Login/register flow** with persistent user profiles
- **Prediction history and analytics dashboard**
- **Offline-ready backend** with SQLite and cached market insights
- **Responsive frontend** built with React, Tailwind CSS, and Chart.js

## 🧩 Technology stack

- **Backend**: Python, Flask, Flask-CORS, Flask-JWT-Extended, Flask-SQLAlchemy
- **Machine Learning**: scikit-learn, NumPy, joblib
- **Frontend**: React, Vite, Tailwind CSS, Chart.js, react-hot-toast, react-icons
- **Database**: SQLite

## 🚀 Setup and run

### 1. Create a Python virtual environment

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If you use Git Bash or WSL:

```bash
python -m venv .venv
source .venv/Scripts/activate
```

### 2. Install backend Python dependencies

```powershell
.\.venv\Scripts\python.exe -m pip install flask flask-cors flask-jwt-extended flask-sqlalchemy numpy joblib scikit-learn
```

### 3. Install frontend dependencies

```powershell
cd frontend
npm install
```

### 4. Run the backend

From the repository root:

```powershell
.\.venv\Scripts\python.exe backend/run.py
```

The backend starts on `http://localhost:5000`.

### 5. Run the frontend

In a separate terminal:

```powershell
cd frontend
npm run dev
```

The frontend starts on `http://localhost:5173`.

### 6. Build production frontend

```powershell
cd frontend
npm run build
```

## 📁 Project structure

- `backend/`
  - `run.py` - Flask app entrypoint
  - `adapters/` - API, database models, and app factory
  - `data/` - Market insight JSON and student datasets
  - `instance/` - Local SQLite data store
  - `model_artifacts/` - Saved model and preprocessed arrays
- `frontend/`
  - `src/` - React pages, components, and API client
  - `package.json` - frontend dependencies and scripts

## 💡 Notes

- The backend exposes API routes under `/api`
- The frontend is configured to call the Flask backend during development
- Use `npm run build` to create a production-ready frontend bundle
