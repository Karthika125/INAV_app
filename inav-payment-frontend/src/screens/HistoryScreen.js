// src/screens/HistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { fetchPayments } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

export default function HistoryScreen({ route }) {
  const prefill = route?.params?.account || '';
  const [account, setAccount] = useState(prefill);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();   // <- KEY PART

  useEffect(() => {
    // Auto-load history when screen becomes active AND account is known
    if (isFocused && account) {
      loadPayments(account);
    }
  }, [isFocused]);

  const loadPayments = async (acct) => {
    const cleaned = acct.trim().toUpperCase();
    if (!cleaned) {
      Alert.alert("Enter a valid account number");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchPayments(cleaned);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error fetching payments");
    } finally {
      setLoading(false);
    }

    setAccount(cleaned);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.acc}>{item.account_number}</Text>
      <Text style={styles.amount}>₹{item.payment_amount}</Text>
      <Text style={styles.date}>{new Date(item.payment_date).toLocaleString()}</Text>
      <Text style={styles.status}>{item.status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Payment History</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="ACC1001"
          value={account}
          onChangeText={setAccount}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.btn} onPress={() => loadPayments(account)}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Get</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : payments.length === 0 ? (
        <Text style={styles.empty}>No payment records found.</Text>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#f5f7fb' },
  title: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  row: { flexDirection: 'row', marginTop: 14 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1
  },
  btn: {
    marginLeft: 8,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  btnText: { color: '#fff', fontWeight: '700' },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10
  },
  acc: { fontWeight: '700' },
  amount: { fontWeight: '700', color: '#007bff' },
  date: { color: '#666', marginTop: 4 },
  status: { marginTop: 4, fontWeight: '600' },
  empty: { marginTop: 20, color: '#666', textAlign: 'center' }
});
