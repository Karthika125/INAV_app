// src/screens/PayScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { createPayment } from '../services/api';

export default function PayScreen({ route, navigation }) {
  // route may provide prefillAccount
  const prefill = route?.params?.prefillAccount || '';
  const [account, setAccount] = useState(prefill);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefill) setAccount(prefill);
  }, [prefill]);

  const validate = () => {
    if (!account || account.trim().length === 0) {
      Alert.alert('Validation', 'Please enter your account number.');
      return false;
    }
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Validation', 'Please enter a valid EMI amount.');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        account_number: account.trim(),
        payment_amount: Number(amount)
      };
      const res = await createPayment(payload);
      // API returns { message, payment }
      const payment = res?.payment;
      if (!payment) {
        throw new Error('Invalid response from server');
      }
      // go to Confirmation with payment object
      navigation.replace('Confirmation', { payment });
    } catch (err) {
      console.error('Payment error', err);
      Alert.alert('Payment Failed', err?.response?.data?.error || 'Could not process payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Make EMI Payment</Text>
          <Text style={styles.hint}>Enter your account number and the EMI amount to pay.</Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              value={account}
              onChangeText={setAccount}
              placeholder="e.g. ACC1001"
              style={styles.input}
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>EMI Amount (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
              returnKeyType="done"
            />
          </View>

          <View style={{ marginTop: 18 }}>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Payment</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>iNav Technologies</Text>
            <Text style={styles.noteText}>#11C, Nippon Q1, NH 66, Palarivattom, Kochi, Kerala 682028</Text>
            <Text style={styles.noteText}>Mobile: +91 9 44 777 88 24 / +91 75 10 10 444 7</Text>
            <Text style={styles.noteText}>info@navtechnologies.in</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  hint: { marginTop: 6, color: '#555' },
  formRow: { marginTop: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e9ee'
  },
  submitBtn: {
    backgroundColor: '#0b3d91',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noteBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#efefef'
  },
  noteTitle: { fontWeight: '700', marginBottom: 6 },
  noteText: { color: '#555', fontSize: 12, marginBottom: 2 }
});
