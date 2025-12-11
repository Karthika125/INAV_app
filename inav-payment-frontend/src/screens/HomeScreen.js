// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { fetchCustomers } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadCustomers = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load customers error', err);
      setError('Failed to load customers. Pull to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.account_number || '').toLowerCase().includes(s)
    );
  });

  const renderCustomer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.emi}>₹{Number(item.emi_due).toLocaleString()}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>{item.account_number}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Interest</Text>
          <Text style={styles.value}>{Number(item.interest_rate).toFixed(2)}%</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Issue Date</Text>
          <Text style={styles.value}>{new Date(item.issue_date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Tenure</Text>
          <Text style={styles.value}>{item.tenure_months} months</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => navigation.navigate('Pay', { prefillAccount: item.account_number })}
        >
          <Text style={styles.payBtnText}>Pay EMI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('History', { account: item.account_number })}
        >
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>iNav — Loan Accounts</Text>
        <Text style={styles.subtitle}>Tap any account to pay EMI or view history</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or account number"
          style={styles.searchInput}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          {refreshing ? <ActivityIndicator color="#007bff" /> : <Text style={styles.refreshText}>Refresh</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.account_number}
          renderItem={renderCustomer}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No accounts found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  headerBlock: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  subtitle: { fontSize: 13, color: '#555', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  searchInput: {
    flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e6e9ee'
  },
  refreshBtn: { marginLeft: 8, paddingHorizontal: 12, paddingVertical: 10 },
  refreshText: { color: '#0b3d91', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03,
    shadowRadius: 6, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#222' },
  emi: { fontSize: 16, fontWeight: '700', color: '#007bff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  col: { flex: 0.48 },
  label: { fontSize: 12, color: '#888' },
  value: { fontSize: 14, color: '#333', marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' },
  payBtn: { backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  payBtnText: { color: '#fff', fontWeight: '600' },
  historyBtn: { borderColor: '#007bff', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  historyBtnText: { color: '#007bff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  error: { color: 'red' }
});
