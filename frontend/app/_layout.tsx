import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter, useSegments, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import storage from '../storage';
import 'react-native-reanimated';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = await storage.getItem('user');
      const segments_str = segments.join('/');
      const inAuthGroup = segments[0] === 'login';

      if (!userStr && !inAuthGroup) {
        // Prevent infinite replace if already on login
        router.replace('/login');
      } else if (userStr && inAuthGroup) {
        router.replace('/(tabs)');
      }
      setIsReady(true);
    };
    checkAuth();
  }, [segments]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
