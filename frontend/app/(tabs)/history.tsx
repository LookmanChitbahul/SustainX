import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, getTransactions } from '../../api';
import storage from '../../storage';

type User = { user_id: string; user_type: string };
type Tx = {
  tx_id: number;
  sender_id: string | null;
  receiver_id: string;
  coin_type: string;
  amount: number;
  tx_type: string;
  timestamp: string;
  status: string;
  block_id: number | null;
};

type Block = {
  id: number;
  current_hash: string;
  prev_hash: string;
};

const COIN_COLORS: Record<string, string> = { Yellow: '#F59E0B', Green: '#22C55E', Red: '#EF4444' };

export default function History() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      storage.getItem('user').then(val => {
        if (val) {
          const u = JSON.parse(val);
          setCurrentUser(u);
          if (!selectedUser) setSelectedUser(u.user_id);
        }
      });

      getUsers().then((data: User[]) => {
        setUsers(data);
      }).catch(() => {}).finally(() => setLoading(false));
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchTxs = () => {
        if (selectedUser) {
          getTransactions(selectedUser).then(setTransactions).catch(() => setTransactions([]));
        }
      };

      fetchTxs();
      const interval = setInterval(fetchTxs, 3000); // 3s polling
      return () => clearInterval(interval);
    }, [selectedUser])
  );

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#F59E0B" /></View>;
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>📋 Transaction History</Text>
      <Text style={s.sub}>System Traceability — Immutable Ledger</Text>

      {/* User Picker - Admin only */}
      {currentUser?.is_admin && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
          {users.map((u) => (
            <TouchableOpacity
              key={u.user_id}
              style={[s.chip, selectedUser === u.user_id && s.chipActive]}
              onPress={() => setSelectedUser(u.user_id)}
            >
              <Text style={[s.chipText, selectedUser === u.user_id && s.chipTextActive]}>{u.user_id}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Transaction Count */}
      <Text style={s.countText}>{transactions.length} transaction(s)</Text>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <Text style={s.emptyText}>No transactions recorded yet.</Text>
      ) : (
        transactions.map((tx) => (
          <View key={tx.tx_id} style={[s.txCard, { borderLeftColor: COIN_COLORS[tx.coin_type] || '#64748B' }]}>
            <View style={s.txHeader}>
              <View style={[s.txBadge, { backgroundColor: tx.tx_type === 'Generation' ? '#1E3A5F' : '#3B1E1E' }]}>
                <Text style={s.txBadgeText}>
                  {tx.tx_type === 'Generation' ? '⚡ Generated' : '🔄 Transfer'}
                </Text>
              </View>
              <Text style={[s.txCoin, { color: COIN_COLORS[tx.coin_type] }]}>
                {tx.coin_type} (≈ {(tx.amount * (tx.coin_type === 'Yellow' ? 4 : tx.coin_type === 'Green' ? 7 : 10)).toFixed(0)} MUR)
              </Text>
            </View>

            <Text style={s.txAmount}>
              {tx.tx_type === 'Transfer' && tx.sender_id === selectedUser ? '-' : '+'}{tx.amount.toFixed(2)} kWh
            </Text>

            <View style={s.txDetails}>
              {tx.sender_id && (
                <Text style={s.txDetail}>From: <Text style={s.txDetailBold}>{tx.sender_id}</Text></Text>
              )}
              <Text style={s.txDetail}>To: <Text style={s.txDetailBold}>{tx.receiver_id}</Text></Text>
              <Text style={s.txDetail}>
                {new Date(tx.timestamp).toLocaleString()}
              </Text>
            </View>

            <View style={[s.statusBadge, tx.status === 'Completed' ? s.statusOk : s.statusFail]}>
              <Text style={s.statusText}>{tx.status}</Text>
            </View>

            {tx.block_id && (
              <View style={s.blockchainBadge}>
                <Text style={s.blockchainText}>🔒 Secured by Block #{tx.block_id}</Text>
              </View>
            )}
          </View>
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  sub: { color: '#64748B', fontSize: 12, marginBottom: 16 },
  chipRow: { flexDirection: 'row', marginBottom: 16 },
  chip: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#0F172A' },
  countText: { color: '#64748B', fontSize: 12, marginBottom: 12 },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 14 },
  txCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 4 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  txBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  txBadgeText: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },
  txCoin: { fontWeight: '800', fontSize: 13 },
  txAmount: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  txDetails: { marginBottom: 8 },
  txDetail: { color: '#64748B', fontSize: 11, marginBottom: 2 },
  txDetailBold: { color: '#94A3B8', fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusOk: { backgroundColor: '#052E16' },
  statusFail: { backgroundColor: '#450A0A' },
  statusText: { color: '#22C55E', fontSize: 11, fontWeight: '600' },
  blockchainBadge: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  blockchainText: { color: '#94A3B8', fontSize: 10, fontFamily: 'monospace' },
});
