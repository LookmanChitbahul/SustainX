import { Platform } from 'react-native';

// const ANDROID_HOST = 'nine-nights-brush.loca.lt'; 
const ANDROID_HOST = 'honest-hornets-ask.loca.lt';
const WEB_HOST = 'localhost:8000';              // Local web
// const EMULATOR_HOST = '10.0.2.2:8000'; // Alternative emulator loopback

function getBaseUrl(): string {
  const isWeb = Platform.OS === 'web';
  const host = isWeb ? WEB_HOST : ANDROID_HOST;
  const protocol = (host.includes('loca.lt') || host.includes('ngrok')) ? 'https' : 'http';
  const url = `${protocol}://${host}/api`;

  if (__DEV__) {
    console.log(`[API] Platform: ${Platform.OS}, Connecting to: ${url}`);
  }
  return url;
}

export async function login(userId: string, password: string): Promise<any> {
  const url = `${getBaseUrl()}/login`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true'
      },
      body: JSON.stringify({ user_id: userId, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Login failed (${res.status})`);
    }
    return res.json();
  } catch (e: any) {
    console.error(`[API ERROR] ${url}:`, e.message);
    throw new Error(e.message === 'Network request failed'
      ? 'Network Error: Backend unreachable. Check if server is running on port 8000.'
      : e.message);
  }
}

export async function getUsers() {
  const res = await fetch(`${getBaseUrl()}/users`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getWallet(userId: string) {
  const res = await fetch(`${getBaseUrl()}/users/${userId}/wallet`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to fetch wallet');
  return res.json();
}

export async function getUserWithWallet(userId: string) {
  const res = await fetch(`${getBaseUrl()}/users/${userId}`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function getTransactions(userId: string) {
  const res = await fetch(`${getBaseUrl()}/users/${userId}/transactions`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function postTransfer(senderId: string, receiverId: string, amount: number) {
  const res = await fetch(`${getBaseUrl()}/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'bypass-tunnel-reminder': 'true'
    },
    body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Transfer failed');
  return data;
}

export async function getMarketData() {
  const res = await fetch(`${getBaseUrl()}/market`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to fetch market data');
  return res.json();
}

export async function checkAnomaly(importKwh: number, exportKwh: number) {
  const res = await fetch(`${getBaseUrl()}/anomaly-check?import_kwh=${importKwh}&export_kwh=${exportKwh}`, {
    headers: { 'bypass-tunnel-reminder': 'true' }
  });
  if (!res.ok) throw new Error('Failed to check anomaly');
  return res.json();
}
