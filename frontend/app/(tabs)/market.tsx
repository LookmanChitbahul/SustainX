import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getMarketData, checkAnomaly } from '../../api';

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export default function Market() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [testImport, setTestImport] = useState('5.0');
  const [testExport, setTestExport] = useState('25.0');
  const [anomalyResult, setAnomalyResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getMarketData()
        .then((d) => setData(d))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, [])
  );

  const handleAnomalyCheck = async () => {
    setChecking(true);
    try {
      const res = await checkAnomaly(parseFloat(testImport), parseFloat(testExport));
      setAnomalyResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#F59E0B" /></View>;
  }

  if (!data) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>No market data available. Ensure backend is running.</Text>
      </View>
    );
  }

  const allCycles = [
    ...(data.history || []).map((h: any) => ({ cycle: h.cycle, price: h.price, predicted: false })),
    ...(data.predictions || []).map((p: any) => ({ cycle: p.cycle, price: p.predicted_price, predicted: true })),
  ];
  const maxPrice = Math.max(...allCycles.map(c => c.price), 1);

  const allSD = [
    ...(data.history || []).map((h: any) => ({ cycle: h.cycle, supply: h.supply, demand: h.demand, predicted: false })),
    ...(data.predictions || []).map((p: any) => ({ cycle: p.cycle, supply: p.predicted_supply, demand: p.predicted_demand, predicted: true })),
  ];
  const maxSD = Math.max(...allSD.map(d => Math.max(d.supply, d.demand)), 1);

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>📈 Energy Market</Text>
      <Text style={s.sub}>ML-Powered Price Prediction & Supply/Demand</Text>

      <View style={s.priceCard}>
        <Text style={s.priceLabel}>Current Green Coin Price</Text>
        <View style={s.priceRow}>
          <Text style={s.priceValue}>{data.current_price.toFixed(2)}</Text>
          <Text style={s.priceUnit}>kWh/unit</Text>
          <View style={[s.trendBadge, data.price_trend === 'up' ? s.trendUp : s.trendDown]}>
            <Text style={s.trendText}>{data.price_trend === 'up' ? '▲ Rising' : '▼ Falling'}</Text>
          </View>
        </View>
      </View>

      <Text style={s.sectionTitle}>Price History & Forecast</Text>
      <View style={s.chartBox}>
        <View style={s.barsContainer}>
          {allCycles.map((item, i) => (
            <View key={i} style={s.barCol}>
              <View style={[s.bar, { height: (item.price / maxPrice) * 120, backgroundColor: item.predicted ? '#7C3AED' : '#F59E0B', opacity: item.predicted ? 0.6 : 1 }]} />
              <Text style={s.barLabel}>C{item.cycle}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={s.sectionTitle}>Supply vs Demand</Text>
      <View style={s.chartBox}>
        <View style={s.barsContainer}>
          {allSD.map((item, i) => (
            <View key={i} style={s.sdCol}>
              <View style={s.sdPair}>
                <View style={[s.sdBar, { height: (item.supply / maxSD) * 100, backgroundColor: '#22C55E', opacity: item.predicted ? 0.5 : 1 }]} />
                <View style={[s.sdBar, { height: (item.demand / maxSD) * 100, backgroundColor: '#EF4444', opacity: item.predicted ? 0.5 : 1 }]} />
              </View>
              <Text style={s.barLabel}>C{item.cycle}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={s.sectionTitle}>ML Prediction Confidence</Text>
      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>Supply Forecast</Text>
          <Text style={s.statValue}>{data.supply_confidence}%</Text>
          <Text style={s.statSub}>Statistical Accuracy</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>Demand Forecast</Text>
          <Text style={s.statValue}>{data.demand_confidence}%</Text>
          <Text style={s.statSub}>Statistical Accuracy</Text>
        </View>
      </View>

      <View style={s.anomalyBox}>
        <Text style={s.anomalyHeader}>🔍 AI Anomaly Verification</Text>
        <Text style={s.anomalySub}>Check reading authenticity via Multi-Model Engine</Text>
        <View style={s.inputRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.inputLabel}>Import (kWh)</Text>
            <TextInput style={s.input} keyboardType="numeric" value={testImport} onChangeText={setTestImport} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.inputLabel}>Export (kWh)</Text>
            <TextInput style={s.input} keyboardType="numeric" value={testExport} onChangeText={setTestExport} />
          </View>
        </View>
        <TouchableOpacity style={s.checkBtn} onPress={handleAnomalyCheck} disabled={checking}>
          <Text style={s.checkBtnText}>{checking ? 'Analyzing...' : 'Analyze Pattern'}</Text>
        </TouchableOpacity>

        {anomalyResult && (
          <View style={[s.resultBox, anomalyResult.is_anomaly ? s.resultFail : s.resultPass]}>
            <View style={s.resultHeader}>
              <Text style={s.resultTitle}>{anomalyResult.is_anomaly ? '⚠️ ANOMALY DETECTED' : '✅ PATTERN VALID'}</Text>
              <Text style={s.resultConf}>{anomalyResult.normal_confidence_pct}% Confidence</Text>
            </View>
            <Text style={s.resultDetail}>{anomalyResult.agreement}</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  emptyText: { color: '#64748B', textAlign: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  sub: { color: '#64748B', fontSize: 13, marginBottom: 20 },
  sectionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  priceCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  priceLabel: { color: '#94A3B8', fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  priceValue: { color: '#F8FAFC', fontSize: 36, fontWeight: '800' },
  priceUnit: { color: '#64748B', fontSize: 14, marginLeft: 8 },
  trendBadge: { marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trendUp: { backgroundColor: '#052E16' },
  trendDown: { backgroundColor: '#450A0A' },
  trendText: { color: '#F8FAFC', fontSize: 11, fontWeight: '700' },
  chartBox: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140 },
  barCol: { alignItems: 'center' },
  bar: { width: 20, borderRadius: 4 },
  barLabel: { color: '#475569', fontSize: 9, marginTop: 4 },
  sdCol: { alignItems: 'center' },
  sdPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  sdBar: { width: 10, borderRadius: 3 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, width: '48%', borderWidth: 1, borderColor: '#334155' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  statValue: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  statSub: { color: '#64748B', fontSize: 10 },
  anomalyBox: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 24, borderWidth: 1, borderColor: '#334155' },
  anomalyHeader: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  anomalySub: { color: '#64748B', fontSize: 12, marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  inputLabel: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  input: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#334155' },
  checkBtn: { backgroundColor: '#F59E0B', borderRadius: 10, padding: 12, alignItems: 'center' },
  checkBtnText: { color: '#0F172A', fontWeight: '800' },
  resultBox: { marginTop: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  resultPass: { backgroundColor: '#052E16', borderLeftColor: '#22C55E' },
  resultFail: { backgroundColor: '#450A0A', borderLeftColor: '#EF4444' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 13 },
  resultConf: { color: '#F8FAFC', fontSize: 11 },
  resultDetail: { color: '#94A3B8', fontSize: 11 },
});
