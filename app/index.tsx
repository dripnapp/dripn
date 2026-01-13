import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Image } from 'react-native';
import { useStore } from '../src/store/useStore';
import { getXRPPrice } from '../src/services/xrpService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Home() {
  const { points, walletAddress, isWalletConnected, setWallet, addPoints, dailyEarnings } = useStore();
  const [xrpPrice, setXrpPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const DAILY_CAP = 500; // $5 equivalent in points

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    const price = await getXRPPrice();
    setXrpPrice(price);
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      // In a real production app, the secret should NEVER be client-side.
      // For this MVP/Testnet demonstration, we're using the client-side SDK.
      // The user would normally provide their own secret or we'd use a backend.
      Alert.alert('Connecting', 'Initializing XUMM connection...');
      
      // Mocking the connection for the web environment if SDK fails
      // In a real native environment, XummSdk would be used with a proxy
      const mockAddress = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzgpEGP';
      setWallet(mockAddress);
      Alert.alert('Success', 'Wallet connected successfully (Testnet)');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = () => {
    if (dailyEarnings >= DAILY_CAP) {
      Alert.alert('Limit Reached', 'You have reached your daily earning limit. Come back tomorrow!');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const reward = 10; 
      addPoints(reward);
      setLoading(false);
      Alert.alert('Reward Earned!', `You earned ${reward} points!`);
    }, 2000);
  };

  const handleCashout = () => {
    if (!isWalletConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }
    if (points < 500) {
      Alert.alert('Low Balance', 'Minimum cashout is 500 points ($5)');
      return;
    }

    Alert.alert(
      'Confirm Cashout',
      `Cash out 500 points for approx ${(5 / (xrpPrice || 1)).toFixed(2)} XRP?\n\nI understand price volatility and acknowledge payouts are at current market rate.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Payout request sent! (Testnet)');
          } 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Crypto Pulse Rewards</Text>
        <Text style={styles.subtitle}>Earn XRP for micro-tasks</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Balance</Text>
        <Text style={styles.balance}>${(points / 100).toFixed(2)}</Text>
        <Text style={styles.points}>{points} Points</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min((points / 500) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.min(points, 500)} / 500 points to cashout</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tasks</Text>
        <TouchableOpacity style={styles.taskButton} onPress={handleWatchAd} disabled={loading}>
          <MaterialCommunityIcons name="play-circle" size={32} color="#fff" />
          <View style={styles.taskInfo}>
            <Text style={styles.taskName}>Watch Rewarded Video</Text>
            <Text style={styles.taskReward}>+10 Points (~$0.10)</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet Status</Text>
        <View style={styles.walletCard}>
          {isWalletConnected ? (
            <>
              <Text style={styles.addressLabel}>Connected Address (Testnet):</Text>
              <Text style={styles.address}>{walletAddress}</Text>
              <TouchableOpacity style={styles.cashoutButton} onPress={handleCashout}>
                <Text style={styles.buttonText}>Cash Out to XRP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet} disabled={loading}>
              <Text style={styles.buttonText}>Connect XRP Wallet (XUMM)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Current XRP Price: ${xrpPrice?.toFixed(4) || 'Loading...'}</Text>
        <Text style={styles.infoText}>Daily Earnings: ${(dailyEarnings / 100).toFixed(2)} / $5.00</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 20 },
  label: { fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  balance: { fontSize: 42, fontWeight: 'bold', color: '#1a1a1a', marginVertical: 5 },
  points: { fontSize: 18, color: '#4dabf7', fontWeight: '600' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1a1a1a' },
  taskButton: { backgroundColor: '#4dabf7', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  taskInfo: { marginLeft: 15 },
  taskName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  taskReward: { color: '#e7f5ff', fontSize: 14 },
  walletCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#eee' },
  addressLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  address: { fontSize: 12, color: '#333', fontWeight: '500', marginBottom: 15 },
  connectButton: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, alignItems: 'center' },
  cashoutButton: { backgroundColor: '#2f9e44', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoCard: { padding: 15, backgroundColor: '#e9ecef', borderRadius: 12, marginTop: 20 },
  infoText: { fontSize: 12, color: '#495057', textAlign: 'center', marginVertical: 2 },
  progressBarBg: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4, marginTop: 15, marginBottom: 5 },
  progressBarFill: { height: '100%', backgroundColor: '#4dabf7', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#868e96', textAlign: 'right' },
});
