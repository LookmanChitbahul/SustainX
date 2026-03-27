# SustainX Mobile — Green Energy Wallet
### ⚡ Sustainable Enterprise Innovation Challenge 2026

The SustainX mobile app is a cross-platform (Android/iOS) dashboard built with **React Native** and **Expo SDK 52**. It serves as the primary gateway for users to interact with the blockchain-secured energy economy.

---

## ✨ Key Innovation Features (Mobile)

1.  **⚡ Secure Virtual Wallet**: Real-time balance updates for **Yellow** (Generation), **Green** (P2P), and **Red** (Grid) coins, with automatic MUR conversion.
2.  **📉 Predictive Energy Market**: Interactive graph displaying dynamic energy prices derived from our **Linear Regression** model, featuring weather-based volatility.
3.  **💸 Peer-to-Peer (P2P) Trading**: Seamless transfer interface for buying/selling green energy directly on the immutable ledger.
4.  **🔒 Blockchain Proof of Stake**: Every transaction history entry features a 🔒 **"Secured by Block"** marker, providing cryptographic verification directly to the user's handset.
5.  **🧠 AI Anomaly Protection**: Visual feedback for meter data integrity, verified by the backend 4-model ensemble.

---

## 🏗️ Technical Stack (Frontend)

*   **Runtime**: Expo SDK 52 (Managed Workflow)
*   **Language**: TypeScript
*   **Navigation**: Expo Router (File-based)
*   **Styling**: NativeWind (Tailwind CSS for React Native)
*   **Icons**: Lucide & Material Community Icons
*   **State**: React Hooks with real-time 3s API polling

---

## 📁 Connection Logic (`api.ts`)

The app communicates with the FastAPI backend via a central API client:
*   **Host Detection**: Automatically switches between local development and remote tunnel URLs.
*   **Bypass Strategy**: Includes the `bypass-tunnel-reminder` header to ensure seamless communication through LocalTunnel and Ngrok proxies.
*   **Location**: Found in `frontend/api.ts`.

---

## 🚀 Rapid Demo Setup

To participate in the multi-user shared demo:

```bash
# 1. Install dependencies
npm install

# 2. Start Expo with the remote tunnel
npx expo start --clear --tunnel
```

---
**Built for the Sustainable Enterprise Innovation Challenge 2026.**
