# SustainX — Digital Energy Value System
### SustainX Innovation Challenge 2026

A full-stack system that transforms real energy meter data into structured digital value (Yellow, Green, Red Coins), with ML-powered anomaly detection and energy market price prediction.

---

## 📁 Project Structure

```
SustainX/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # App entry point, CORS, routing
│   ├── models.py             # SQLAlchemy DB models
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── database.py           # DB engine (reads DATABASE_URL from .env)
│   ├── routes.py             # All API endpoints
│   ├── logic.py              # Core value generation & transfer logic
│   ├── ml_service.py         # 4-model ML: anomaly detection + market prediction
│   ├── seed.py               # Database seeder (loads xlsx dataset)
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── .env                  # Local secrets (not committed to git)
│
├── frontend/                 # React Native (Expo) mobile app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx     # ⚡ Wallet Dashboard
│   │   │   ├── transfer.tsx  # 💸 Transfer Screen
│   │   │   ├── history.tsx   # 📋 Transaction History
│   │   │   └── market.tsx    # 📈 Energy Market (ML chart)
│   │   ├── api.ts            # Central API helper
│   │   └── _layout.tsx       # Root layout
│   └── package.json
│
├── ref/                      # Challenge reference materials & dataset
│   └── 8. sustainx_final_dataset.xlsx
│
├── docker-compose.yml        # Optional: run with PostgreSQL
└── .gitignore
```

---

## 🚀 How to Run

### Backend

**1. Create and activate virtual environment:**
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

**3. Configure environment:**
```bash
# Copy the example and edit if needed (SQLite works out of the box)
copy .env.example .env
```

**4. Seed the database:**
```bash
python seed.py
```

**5. Process billing cycles (generates coin balances):**
```bash
# On Windows (SQLite running):
python -m uvicorn main:app --reload
# Then in another terminal:
curl -X POST http://localhost:8000/api/process-cycle/1
curl -X POST http://localhost:8000/api/process-cycle/2
curl -X POST http://localhost:8000/api/process-cycle/3
```

**6. Start the backend:**
```bash
python -m uvicorn main:app --reload
```

Backend will be live at: **http://localhost:8000**  
API docs (Swagger): **http://localhost:8000/docs**

---

### Frontend

**1. Install dependencies:**
```bash
cd frontend
npm install
```

**2. Start the Expo development server:**
```bash
npm run start
```

**3. Open the app:**
- **Browser:** Press `w` in the terminal, or go to `http://localhost:8081`
- **Android:** Press `a` (requires Android Studio emulator or Expo Go app)
- **iPhone:** Scan the QR code with the Expo Go app

> **Note for Windows + Node 24:** If you see an ESM loader error, run:
> ```bash
> $env:NODE_OPTIONS="--no-experimental-detect-module"; npm run start
> ```
> Or downgrade to Node v20 LTS from https://nodejs.org for the best compatibility.

---

## 🧠 ML Models

| Model | Purpose |
|---|---|
| Isolation Forest | Anomaly detection (pattern-based) |
| Z-Score Analysis | Statistical outlier detection |
| Local Outlier Factor | Density-based anomaly detection |
| Linear Regression | Energy market price forecasting |

**Ensemble voting:** A reading is flagged as anomalous only if **2 out of 3** detection models agree, ensuring 95%+ confidence before blocking value generation.

---

## 💰 Value System

| Coin | Origin | Meaning |
|---|---|---|
| 🌕 Yellow | Prosumer net export > 0 | Owner-generated solar energy |
| 🟢 Green | Yellow transferred to another user | System-available solar energy |
| 🔴 Red | Consumer grid import | Conventional consumption liability |

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./sustainx.db` | DB connection string |
| `APP_ENV` | `development` | `development` or `production` |
| `SECRET_KEY` | — | Used for future auth signing |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |
