import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getUsers, getWallet, postTransfer } from '../../api';
import storage from '../../storage';

type User = { user_id: string; user_type: string };

export default function Transfer() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [senderBalance, setSenderBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    storage.getItem('user').then(val => {
      if (val) {
        const u = JSON.parse(val);
        setCurrentUser(u);
        setSenderId(u.user_id);
      }
    });

    getUsers().then((data: User[]) => {
      setUsers(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (senderId) {
      getWallet(senderId).then((w: any) => {
        // prosumers send Yellow, Consumers send Green
        const isProsumer = currentUser?.user_type === 'prosumer';
        setSenderBalance(isProsumer ? w.yellow_balance : w.green_balance);
      }).catch(() => setSenderBalance(null));
    }
  }, [senderId, currentUser]);

  const handleTransfer = async () => {
    if (!senderId || !receiverId || !amount) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (senderId === receiverId) {
      Alert.alert('Error', 'Cannot transfer to yourself.');
      return;
    }
    setLoading(true);
    setSuccess(null);
    try {
      const isProsumer = currentUser?.user_type === 'prosumer';
      const amtNum = parseFloat(amount);
      const tx = await postTransfer(senderId, receiverId, amtNum);
      
      const msg = isProsumer 
        ? `✅ Transferred ${amount} Yellow → Green Coins to ${receiverId}`
        : `✅ Transferred ${amount} Green → Green Coins to ${receiverId}`;
        
      setSuccess(msg);
      setAmount('');
      // Refresh sender balance
      getWallet(senderId).then((w: any) => {
        setSenderBalance(isProsumer ? w.yellow_balance : w.green_balance);
      }).catch(() => {});
    } catch (e: any) {
      Alert.alert('Transfer Failed', e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on Prosumer/Consumer rules
  const getFilteredReceivers = () => {
    if (!currentUser) return [];
    if (currentUser.is_admin) return users.filter(u => u.user_id !== senderId);
    
    // Prosumers see only Consumers
    if (currentUser.user_type === 'prosumer') {
      return users.filter(u => u.user_type === 'consumer');
    }
    // Consumers see only other Consumers
    if (currentUser.user_type === 'consumer') {
      return users.filter(u => u.user_type === 'consumer' && u.user_id !== currentUser.user_id);
    }
    return [];
  };

  const filteredReceivers = getFilteredReceivers();
  const isProsumer = currentUser?.user_type === 'prosumer';

  if (currentUser?.is_admin) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#F59E0B', marginBottom: 12 }}>🔒 Admin View</Text>
        <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 16, lineHeight: 24, paddingHorizontal: 20 }}>
          Admins have read-only permissions across user profiles to monitor the ecosystem. Standard transaction functionality is disabled.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>💸 Send Value</Text>

      {/* Sender Info */}
      <View style={s.lockBox}>
        <Text style={s.lockLabel}>
          Logged in as: <Text style={{color: '#F59E0B'}}>{currentUser?.user_id}</Text> ({currentUser?.user_type})
        </Text>
      </View>

      {senderBalance !== null && (
        <View style={[s.balanceBox, !isProsumer && { borderLeftColor: '#22C55E' }]}>
          <Text style={s.balanceLabel}>Available {isProsumer ? 'Yellow' : 'Green'} Coins</Text>
          <Text style={[s.balanceValue, !isProsumer && { color: '#22C55E' }]}>{senderBalance.toFixed(2)}</Text>
        </View>
      )}

      {/* Receiver Picker */}
      <Text style={s.label}>To (Receiver - {isProsumer ? 'Consumers Only' : 'Peers Only'})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {filteredReceivers.map((u) => (
          <TouchableOpacity
            key={u.user_id}
            style={[s.chip, receiverId === u.user_id && s.chipActive]}
            onPress={() => setReceiverId(u.user_id)}
          >
            <Text style={[s.chipText, receiverId === u.user_id && s.chipTextActive]}>{u.user_id}</Text>
            <Text style={[s.chipSub, receiverId === u.user_id && s.chipSubActive]}>{u.user_type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredReceivers.length === 0 && (
        <Text style={{color: '#64748B', fontSize: 12, fontStyle: 'italic', marginBottom: 10}}>No eligible receivers found.</Text>
      )}

      {/* Amount Input */}
      <Text style={s.label}>Amount</Text>
      <TextInput
        style={s.input}
        placeholder="0.00"
        placeholderTextColor="#475569"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Transfer Button */}
      <TouchableOpacity 
        style={[s.btn, !isProsumer && { backgroundColor: '#22C55E' }]} 
        onPress={handleTransfer} 
        disabled={loading || filteredReceivers.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={s.btnText}>Confirm {isProsumer ? 'Sale' : 'Transfer'}</Text>
        )}
      </TouchableOpacity>

      {/* Transformation Note */}
      <View style={s.noteBox}>
        <Text style={s.noteTitle}>🔄 {isProsumer ? 'Supply Generation' : 'P2P Circulation'}</Text>
        <Text style={s.noteText}>
          {isProsumer 
            ? "When you transfer Yellow Coins (Prosumer Export), they convert to Green Coins (Market Supply) for Consumers to use."
            : "Consumers transfer Green Coins directly between each other to settle P2P energy trades secured by the blockchain."}
        </Text>
      </View>

      {/* Success Message */}
      {success && (
        <View style={s.successBox}>
          <Text style={s.successText}>{success}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16, paddingTop: 50 },
  header: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 20 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 },
  chipRow: { flexDirection: 'row', marginBottom: 8 },
  chip: { backgroundColor: '#1E293B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  chipTextActive: { color: '#0F172A' },
  chipSub: { color: '#64748B', fontSize: 10, marginTop: 2 },
  chipSubActive: { color: '#451A03' },
  balanceBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  balanceLabel: { color: '#94A3B8', fontSize: 13 },
  balanceValue: { color: '#F59E0B', fontSize: 22, fontWeight: '800' },
  input: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, fontSize: 18, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  btn: { backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  noteBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  noteTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  noteText: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  successBox: { backgroundColor: '#052E16', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#22C55E', marginBottom: 30 },
  successText: { color: '#22C55E', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  lockBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  lockLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
