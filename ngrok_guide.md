# SustainX Remote Access Guide (ngrok)

To allow your friends to access the SustainX Innovation Challenge project remotely, follow these steps to expose your local backend to the internet.

## 1. Install ngrok
If you haven't already:
1. Download from [ngrok.com](https://ngrok.com/download).
2. Sign up for a free account to get your `authtoken`.
3. Run: `ngrok config add-authtoken <your-token>`

## 2. Start the Backend Tunnel
Open a NEW terminal and run:
```bash
ngrok http 8000
```
This will give you a public URL like `https://a1b2-c3d4.ngrok-free.app`.

## 3. Update the App Config
Modify `frontend/api.ts` to use your new ngrok URL so the mobile app knows where to send requests:

```typescript
// frontend/api.ts
const ANDROID_HOST = 'a1b2-c3d4.ngrok-free.app'; // Replace with YOUR ngrok URL
```
> **Note**: Do not include `http://` or `/api` in the `ANDROID_HOST` variable.

## 4. Multi-User Interaction
Once ngrok is running:
- **Prosumer**: Log in as `U001` on one device.
- **Consumer**: Log in as `U002` on another device.
- **Admin**: Log in as `admin` on your main laptop/web.
- **Real-time**: When the Prosumer transfers coins, the Admin and Consumer will see their balances update within 3 seconds!

---
**Challenge Demo Adjustments:**
- **Billing Cycles**: 30 Seconds (Mocked).
- **Pricing**: Dynamic (±1-2 MUR Fluctuation factor).
