# SustainX — Blockchain-Secured Digital Energy System
### ⚡ Innovation Challenge 2026: "Verified Green Economy"

SustainX is a state-of-the-art Web3-inspired platform that transforms real-time energy meter data into a secure digital economy. Using **SHA-256 Blockchain Technology**, we ensure that every energy transaction is immutable, traceable, and verified by an ensemble of Machine Learning models.

---

## 🏗️ System Architecture & Data Flow

SustainX connects physical energy generation to digital value through a rigid, multi-layered verification pipeline:

1.  **Data Ingestion**: High-frequency meter readings (Import/Export kWh) are ingested from the **Prosumer** device.
2.  **Ensemble Verification**: The data is immediately analyzed by 4 ML models to check for anomalies or tampering.
3.  **Billing & Value Creation**: Verified data is processed into **Yellow Coins** (Export) and liabilities are marked as **Red Coins** (Import).
4.  **Blockchain Mining**: A new `Block` is generated using **SHA-256** hashing, linking the billing summary to the previous block's hash.
5.  **Immutable Ledger**: The transaction is written to the PostgreSQL ledger with a reference to the block identity.
6.  **P2P Market**: Users can then trade **Green Coins** (P2P Energy) at a dynamic market rate.

---

## 🔐 Core Functionalities & Technical Deep-Dive

### 1. The Immutable Ledger (Blockchain)
*   **What it is**: A private blockchain where each block represents a set of verified energy events (Billing or Transfers).
*   **Hashing Logic**: We use `hashlib` to generate a SHA-256 signature combining `prev_hash`, `timestamp`, and `data_summary`.
*   **Code Location**: `backend/app/services/energy_logic.py` (`mine_block` function).
*   **Connection**: Every entry in the `transactions` table links to a `block_id` in the `blocks` table, providing cryptographic proof of data integrity.

### 2. ML Anomaly Ensemble (Ensemble Learning)
*   **What it is**: A "majority rule" voting system that protects the economy from meter fraud.
*   **Models Used**: Isolation Forest (Anomalies), Z-Score (Spikes), Local Outlier Factor (Density).
*   **Code Location**: `backend/app/ml/anomaly.py`.
*   **Integration**: The `is_anomaly` endpoint requires 2/3 agreement before mining a block.

### 3. Dynamic Market Prediction (MUR Valuation)
*   **What it is**: Live price derivation for the Green Coin (P2P Energy).
*   **Formula**: `Base (7.00 MUR) * [Supply/Demand Ratio] + Weather Variance`.
*   **Code Location**: `backend/app/ml/market.py`.
*   **Financials**:
    *   **🟡 Yellow Coin**: 4 MUR (Generation Reward)
    *   **🟢 Green Coin**: ~7 MUR (P2P Market Rate)
    *   **🔴 Red Coin**: 10 MUR (Grid Liability)

### 4. Rapid Billing Cycles
*   **What it is**: To simulate long-term energy use in a short demo, we've compressed years into **30-second cycles**.
*   **Code Location**: `backend/app/services/energy_logic.py` (`process_billing` function).
*   **Real-time UI**: The mobile dashboard polls every **3 seconds** to show live blockchain activity.

---

## 📁 Modular Folder Structure

The project follows a clean, "feature-first" architecture for high standard scalability:

*   `backend/app/api/`: **Endpoints**. Handles incoming requests from the mobile app (Login, Market, Transfers).
*   `backend/app/ml/`: **Intelligence**. Contains the ensemble logic and the linear regression price predictor.
*   `backend/app/models/`: **Persistence**. Defines the SQLAlchemy/PostgreSQL schema for Users, Wallets, and the Blockchain.
*   `backend/app/services/`: **Logic**. The "Engine" of the system. Manages the 30s billing cycles and block mining.
*   `backend/app/db/`: **Infrastructure**. Managed database sessions and engine pooling.
*   `frontend/app/`: **Interface**. React Native screens (Tabs) representing the Dashboard, Market, and Ledger.

---

---

## 🔑 Demo Credentials

For convenience during the innovation challenge, use the following seeded accounts:

| User ID | Role | Password |
|---|---|---|
| **PR001** | Prosumer (Energy Seller) | `12345678` |
| **C001** | Consumer (Energy Buyer) | `12345678` |
| **Admin** | System Administrator | `12345678` |

---

## ⚙️ Database & Connection Logic

SustainX uses a robust **PostgreSQL** database for production-grade reliability:

*   **Engine**: SQLAlchemy with `psycopg2` driver.
*   **Connection**: Managed via `DATABASE_URL` in `.env`.
*   **Initialization**: `Base.metadata.create_all(bind=engine)` runs on backend startup to ensure tables are synced.
*   **Location**: Configuration is in `backend/app/db/session.py`.

---

## 🚀 Demo Run (Innovation Challenge Mode)

### 1. Step: Backend & Tunneling
Launch the secure API via LocalTunnel:
```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --port 8000
npx localtunnel --port 8000
```

### 2. Step: Mobile Launch
Start the Expo tunnel for global remote access:
```bash
cd frontend
npx expo start --clear --tunnel
```

---
**Built for the Sustainable Enterprise Innovation Challenge 2026.**
