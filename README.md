# VectorCareer AI 🚀

An AI-powered web application that analyzes a student's academic and soft skills to predict their ideal career path in the tech industry. It features a persistent user profile system, an interactive dashboard, and real-world job market data—all designed to run 100% offline.

## ✨ Features

- **🧠 Machine Learning Prediction**: Uses a Random Forest Classifier trained on a realistic, statistically accurate dataset of 2,000 students to predict one of 6 distinct tech roles.
- **🔐 Secure User Authentication**: Full user login and registration system using Flask-Login and password hashing.
- **👤 Persistent Skill Profiles**: Users set their baseline skills during sign-up. The prediction UI pulls these saved stats by default.
- **⚡ Two-Mode Prediction UI**: 
  - **Quick Predict**: Run lightning-fast predictions using your saved skills.
  - **Update & Predict**: Tweak your skills to automatically save your new, improved profile back to the database.
- **📊 Real-World Industry Insights**: The prediction results dynamically fetch cached real-world 2024 tech statistics (Active Job Openings, Salaries, Demand Trends) so the app works perfectly offline.
- **💎 Premium UI**: Built completely with Tailwind CSS, featuring beautiful gradients, micro-animations, glassmorphism, and responsive radar charts via Chart.js.

## 🛠️ Technology Stack

- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-Login
- **Machine Learning**: Scikit-Learn, Pandas, NumPy
- **Frontend**: HTML5, Tailwind CSS, Chart.js, Vanilla JavaScript
- **Database**: SQLite (built-in, perfectly portable)

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have Python 3.9+ and Node.js 18+ installed on your system.

### 2. Backend Setup
```bash
# Generate the realistic market insights (saved to backend/data/market_insights.json)
python backend/ml_old/fetch_market_data.py

# Generate the realistic student dataset
python backend/ml_old/download_dataset.py

# Process the data (creates artifacts in backend/model_artifacts/)
python backend/ml_old/data_pipeline.py

# Train the Random Forest Model
python backend/ml_old/train_model.py

# Run the Flask Backend API
python -m backend.run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure (Hexagonal Monorepo)

- `backend/` - The Flask Application (Hexagonal Architecture)
  - `core/` - Domain Entities and Interfaces (Ports)
  - `adapters/` - Framework implementations (Flask Inbound Web API, SQLAlchemy DB, ML Service)
  - `data/` - Holds the generated CSV dataset and the offline `market_insights.json`.
  - `instance/` - Contains the local `database.db` SQLite file.
- `frontend/` - The React Application (Vite)
  - `src/` - React components and pages.
