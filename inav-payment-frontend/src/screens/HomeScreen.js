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
  TextInput,
  StatusBar
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

  // Calculate total EMI due
  const totalEMIDue = filtered.reduce((sum, c) => sum + Number(c.emi_due || 0), 0);

  const renderCustomer = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => navigation.navigate('Pay', { prefillAccount: item.account_number })}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{(item.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.accountNumber}>A/C {item.account_number}</Text>
        </View>
        <View style={styles.emiContainer}>
          <Text style={styles.emiLabel}>EMI Due</Text>
          <Text style={styles.emi}>₹{Number(item.emi_due).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Interest Rate</Text>
          <Text style={styles.detailValue}>{Number(item.interest_rate).toFixed(2)}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tenure</Text>
          <Text style={styles.detailValue}>{item.tenure_months} months</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Issue Date</Text>
          <Text style={styles.detailValue}>
            {new Date(item.issue_date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => navigation.navigate('Pay', { prefillAccount: item.account_number })}
          activeOpacity={0.8}
        >
          <Text style={styles.payBtnText}>💳 Pay Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('History', { account: item.account_number })}
          activeOpacity={0.8}
        >
          <Text style={styles.historyBtnText}>📊 History</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Loan Accounts</Text>
          <Text style={styles.headerSubtitle}>Manage your EMI payments</Text>
        </View>
        
        {!loading && !error && filtered.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total EMI Due</Text>
            <Text style={styles.summaryAmount}>₹{totalEMIDue.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryAccounts}>{filtered.length} account{filtered.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or account number"
            placeholderTextColor="#999"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCustomers}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.account_number}
          renderItem={renderCustomer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#1a73e8']}
              tintColor="#1a73e8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No accounts found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.85)', 
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  summaryAccounts: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
    paddingHorizontal: 8,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#757575',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#424242',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a73e8',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  accountNumber: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  emiContainer: {
    alignItems: 'flex-end',
  },
  emiLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emi: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a73e8',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  payBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  historyBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyBtnText: {
    color: '#424242',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});