import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, getUserWithWallet } from '../../api';
import storage from '../../storage';
import { useRouter } from 'expo-router';

type User = { user_id: string; user_type: string; meter_id: string };
type Wallet = { yellow_balance: number; green_balance: number; red_balance: number };

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    storage.getItem('user').then(val => {
      if (val) {
        const u = JSON.parse(val);
        setUser(u);
        setSelectedUser(u.user_id);
      }
    });

    getUsers()
      .then((data: User[]) => {
        setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedUser) loadWallet(selectedUser);
    }, [selectedUser])
  );

  const loadWallet = (userId: string) => {
    getUserWithWallet(userId)
      .then((data: any) => {
        setWallet(data.wallet);
        setUserType(data.user_type);
      })
      .catch(() => setWallet(null));
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={s.loadingText}>Loading SustainX...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.header}>⚡ SustainX Wallet</Text>
        <TouchableOpacity onPress={async () => { await storage.clear(); router.replace('/login'); }}>
          <Text style={s.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Picker - Only show for Admin */}
      {user?.is_admin && (
        <>
          <Text style={s.label}>Select User (Admin View)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.userRow}>
            {users.map((u) => (
              <TouchableOpacity
                key={u.user_id}
                style={[s.userChip, selectedUser === u.user_id && s.userChipActive]}
                onPress={() => setSelectedUser(u.user_id)}
              >
                <Text style={[s.userChipText, selectedUser === u.user_id && s.userChipTextActive]}>
                  {u.user_id}
                </Text>
                <Text style={[s.userChipSub, selectedUser === u.user_id && s.userChipSubActive]}>
                  {u.user_type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* User Badge */}
      <View style={s.badgeRow}>
        <View style={[s.badge, userType === 'prosumer' ? s.badgeProsumer : s.badgeConsumer]}>
          <Text style={s.badgeText}>
            {userType === 'prosumer' ? '☀️ Prosumer' : '🔌 Consumer'}
          </Text>
        </View>
        <Text style={s.meterId}>
          Meter: {users.find((u) => u.user_id === selectedUser)?.meter_id}
        </Text>
      </View>

      {/* Coin Cards */}
      {wallet ? (
        <>
          <View style={[s.card, { borderLeftColor: '#F59E0B' }]}>  
            <Text style={s.cardLabel}>🌕 Yellow Coins</Text>
            <Text style={[s.cardValue, { color: '#F59E0B' }]}>{wallet.yellow_balance.toFixed(2)}</Text>
            <Text style={s.cardDesc}>Owner-generated solar energy</Text>
          </View>

          <View style={[s.card, { borderLeftColor: '#22C55E' }]}>
            <Text style={s.cardLabel}>🟢 Green Coins</Text>
            <Text style={[s.cardValue, { color: '#22C55E' }]}>{wallet.green_balance.toFixed(2)}</Text>
            <Text style={s.cardDesc}>System-available solar origin</Text>
          </View>

          <View style={[s.card, { borderLeftColor: '#EF4444' }]}>
            <Text style={s.cardLabel}>🔴 Red Coins</Text>
            <Text style={[s.cardValue, { color: '#EF4444' }]}>{wallet.red_balance.toFixed(2)}</Text>
            <Text style={s.cardDesc}>Conventional consumption liability</Text>
          </View>

          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Total Value</Text>
            <Text style={s.totalValue}>
              {(wallet.yellow_balance + wallet.green_balance).toFixed(2)} kWh
            </Text>
            <Text style={s.totalSub}>(Yellow + Green = Usable Energy)</Text>
          </View>
        </>
      ) : (
        <Text style={s.noData}>No wallet data available. Process a billing cycle first.</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
  logout: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  userRow: { flexDirection: 'row', marginBottom: 16 },
  userChip: { backgroundColor: '#1E293B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  userChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  userChipText: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  userChipTextActive: { color: '#0F172A' },
  userChipSub: { color: '#64748B', fontSize: 10, marginTop: 2 },
  userChipSubActive: { color: '#451A03' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeProsumer: { backgroundColor: '#422006' },
  badgeConsumer: { backgroundColor: '#1E293B' },
  badgeText: { color: '#FDE68A', fontWeight: '600', fontSize: 13 },
  meterId: { color: '#64748B', marginLeft: 12, fontSize: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 12, borderLeftWidth: 4 },
  cardLabel: { color: '#94A3B8', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  cardValue: { fontSize: 36, fontWeight: '800' },
  cardDesc: { color: '#475569', fontSize: 11, marginTop: 4 },
  totalCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  totalLabel: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  totalValue: { color: '#F8FAFC', fontSize: 32, fontWeight: '800', marginTop: 4 },
  totalSub: { color: '#475569', fontSize: 11, marginTop: 4 },
  noData: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
