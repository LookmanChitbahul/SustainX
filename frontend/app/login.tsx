import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { login } from '../api';
import storage from '../storage';

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both User ID and Password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(userId, password);
      // Persist user info
      await storage.setItem('user', JSON.stringify(user));
      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.logoBox}>
        <Text style={s.logoText}>⚡ SustainX</Text>
        <Text style={s.logoSub}>Digital Energy Value System</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>User ID</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. U001 or admin"
          placeholderTextColor="#475569"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />

        <Text style={s.label}>Password</Text>
        <TextInput
          style={s.input}
          placeholder="••••••••"
          placeholderTextColor="#475569"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={s.btnText}>Login</Text>}
        </TouchableOpacity>

        <View style={s.demoBox}>
          <Text style={s.demoTitle}>🏆 Demo Credentials</Text>
          <Text style={s.demoText}>Admin ID: admin</Text>
          <Text style={s.demoText}>Prosumer ID: PR001</Text>
          <Text style={s.demoText}>Consumer ID: C001</Text>
          <Text style={s.demoText}>(Password for all is 12345678)</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 24 },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 42, fontWeight: '900', color: '#F59E0B' },
  logoSub: { color: '#64748B', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, color: '#F8FAFC', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#0F172A', fontWeight: '800', fontSize: 18 },
  demoBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  demoTitle: { color: '#F59E0B', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
  demoText: { color: '#CBD5E1', fontSize: 14, textAlign: 'center', marginVertical: 3 },
});
