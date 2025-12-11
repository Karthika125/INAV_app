// src/screens/ConfirmationScreen.js
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ConfirmationScreen({ route, navigation }) {
  const payment = route?.params?.payment;

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>No payment information available.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.success}>Payment Confirmed ✅</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>{payment.account_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₹{Number(payment.payment_amount).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(payment.payment_date).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: '#0b3d91' }]}>{payment.status}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.popToTop()}>
        <Text style={styles.doneText}>Done - Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#f5f7fb' },
  card: {
    backgroundColor: '#fff', padding: 18, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03
  },
  success: { fontSize: 20, fontWeight: '700', color: '#1a7f2d', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  doneBtn: { marginTop: 20, backgroundColor: '#0b3d91', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  doneText: { color: '#fff', fontWeight: '700' },
  backBtn: { marginTop: 20, padding: 12, alignItems: 'center' },
  backText: { color: '#0b3d91', fontWeight: '700' },
  error: { color: 'red', marginTop: 40, textAlign: 'center' }
});
