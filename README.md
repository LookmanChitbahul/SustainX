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

### 4. 👥 The Digital Energy Social Contract (Prosumer & Consumer)

SustainX defines two distinct economic roles that interact on the blockchain to create a balanced green economy:

#### **A. The Prosumer (Producer + Consumer)**
*   **Identity**: Households or businesses with renewable installations (Solar/Wind).
*   **The "Yellow" Engine**: For every kWh exported to the grid, the Prosumer is minted **Yellow Coins**.
*   **The Sales Role**: Prosumers act as the **Suppliers** of the economy. They transfer their Yellow Coins to the "Market" (Consumers).
*   **Value Transformation**: When a Prosumer transfers value to a Consumer, the **Yellow Coins convert to Green Coins**. This represents energy leaving a private site and becoming part of the community supply.

#### **B. The Consumer (Buyer / Peer)**
*   **Identity**: Standard households importing energy from the grid.
*   **The "Red" Liability**: Every kWh imported generates **Red Coins**, which represent a financial liability (Grid Debt).
*   **The P2P Trader**: Consumers "Buy" Green energy to settle their accounts. They can also trade **Green Coins** with each other.
*   **Value Consistency**: Consumer-to-Consumer transfers remain **Green**. This represents a peer-to-peer circulation of verified renewable energy credits within a local neighborhood.

### 5. ⏲️ Rapid Billing Cycles (30s)
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

---

## 🚀 Demo Run (Manual Terminal Mode)

To ensure high-performance remote access for **all 5 team members**, follow this "3-Terminal Setup" starting the backend and frontend separately:

### Terminal 1: Backend Server
Start the core logic and database listener:
```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload
```

### Terminal 2: Backend Tunnel (Remote Access)
Enable the bridge to allow mobile apps to reach the backend from anywhere:
```bash
npx localtunnel --port 8000
```
**Wait for the URL** (e.g., `funny-cats-jump.loca.lt`). Copy the hostname and paste it into **`frontend/api.ts`** as `ANDROID_HOST`.

### Terminal 3: Mobile Launch (Expo)
Scan this QR code with your 5 team members to join the live energy ledger:
```bash
cd frontend
npx expo start --clear --tunnel
```

---
**Built for the Sustainable Enterprise Innovation Challenge 2026.**
