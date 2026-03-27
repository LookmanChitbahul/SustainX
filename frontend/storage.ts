import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const memoryStore = new Map<string, string>();

let cachedAsyncStorage: any = null;
const getAsyncStorage = () => {
  if (isWeb) return null;
  if (cachedAsyncStorage) return cachedAsyncStorage;
  try {
    // Lazy require to avoid errors on platforms where it's not needed
    cachedAsyncStorage = require('@react-native-async-storage/async-storage').default;
    return cachedAsyncStorage;
  } catch (e) {
    console.warn('AsyncStorage not available, using memory fallback');
    return null;
  }
};

const storage = {
  setItem: async (key: string, value: string) => {
    try {
      if (isWeb) {
        window.localStorage.setItem(key, value);
      } else {
        const as = getAsyncStorage();
        if (as) await as.setItem(key, value);
        else memoryStore.set(key, value);
      }
    } catch (e) {
      memoryStore.set(key, value);
    }
  },
  getItem: async (key: string) => {
    try {
      if (isWeb) {
        return window.localStorage.getItem(key);
      } else {
        const as = getAsyncStorage();
        if (as) return await as.getItem(key);
        else return memoryStore.get(key) || null;
      }
    } catch (e) {
      return memoryStore.get(key) || null;
    }
  },
  removeItem: async (key: string) => {
    try {
      if (isWeb) {
        window.localStorage.removeItem(key);
      } else {
        const as = getAsyncStorage();
        if (as) await as.removeItem(key);
        else memoryStore.delete(key);
      }
    } catch (e) {
      memoryStore.delete(key);
    }
  },
  clear: async () => {
    try {
      if (isWeb) {
        window.localStorage.clear();
      } else {
        const as = getAsyncStorage();
        if (as) await as.clear();
        else memoryStore.clear();
      }
    } catch (e) {
      memoryStore.clear();
    }
  }
};

export default storage;
