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
  ScrollView,
  StatusBar
} from 'react-native';
import { createPayment } from '../services/api';

export default function PayScreen({ route, navigation }) {
  const prefill = route?.params?.prefillAccount || '';
  const [account, setAccount] = useState(prefill);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountFocused, setAccountFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  useEffect(() => {
    if (prefill) setAccount(prefill);
  }, [prefill]);

  const validate = () => {
    if (!account || account.trim().length === 0) {
      Alert.alert('Missing Information', 'Please enter your account number.', [{ text: 'OK' }]);
      return false;
    }
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid EMI amount greater than zero.', [{ text: 'OK' }]);
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
      const payment = res?.payment;
      if (!payment) {
        throw new Error('Invalid response from server');
      }
      navigation.replace('Confirmation', { payment });
    } catch (err) {
      console.error('Payment error', err);
      Alert.alert(
        'Payment Failed', 
        err?.response?.data?.error || 'Could not process payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('en-IN');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Make Payment</Text>
              <Text style={styles.headerSubtitle}>Enter EMI payment details</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <View style={[
                  styles.inputContainer, 
                  accountFocused && styles.inputContainerFocused
                ]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    value={account}
                    onChangeText={setAccount}
                    placeholder="e.g. ACC1001"
                    placeholderTextColor="#999"
                    style={styles.input}
                    autoCapitalize="characters"
                    returnKeyType="next"
                    onFocus={() => setAccountFocused(true)}
                    onBlur={() => setAccountFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMI Amount</Text>
                <View style={[
                  styles.inputContainer,
                  amountFocused && styles.inputContainerFocused
                ]}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    value={amount}
                    onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
                    placeholder="Enter amount"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    style={styles.input}
                    returnKeyType="done"
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                  />
                </View>
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                  <Text style={styles.amountPreview}>
                    You're paying: ₹{formatAmount(amount)}
                  </Text>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
                onPress={onSubmit} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.submitText, { marginLeft: 10 }]}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.submitContent}>
                    <Text style={styles.submitText}>Continue to Payment</Text>
                    <Text style={styles.submitIcon}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoTitle}>Payment Information</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoContent}>
                <Text style={styles.infoItem}>• Payments are processed instantly</Text>
                <Text style={styles.infoItem}>• You'll receive a confirmation receipt</Text>
                <Text style={styles.infoItem}>• Keep your account number handy</Text>
                <Text style={styles.infoItem}>• Contact support for any issues</Text>
              </View>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>iNav Technologies</Text>
              <View style={styles.contactDivider} />
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📍</Text>
                <Text style={styles.contactText}>
                  #11C, Nippon Q1, NH 66{'\n'}Palarivattom, Kochi{'\n'}Kerala 682028
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📞</Text>
                <View>
                  <Text style={styles.contactText}>+91 9 44 777 88 24</Text>
                  <Text style={styles.contactText}>+91 75 10 10 444 7</Text>
                </View>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>✉️</Text>
                <Text style={styles.contactText}>info@navtechnologies.in</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    backgroundColor: '#fff',
    borderColor: '#1a73e8',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 0,
    fontWeight: '500',
  },
  amountPreview: {
    marginTop: 8,
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitIcon: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 8,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565c0',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#bbdefb',
    marginBottom: 12,
  },
  infoContent: {
    gap: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  contactText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
    flex: 1,
  },
});