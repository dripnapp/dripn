import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { getXRPPrice } from '../src/services/xrpService';
import { createSignInRequest, pollForSignIn } from '../src/services/xummService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SplashScreen from '../src/components/SplashScreen';
import OnboardingScreen from '../src/components/OnboardingScreen';
import AcknowledgmentPopup from '../src/components/AcknowledgmentPopup';
import VideoPlayer from '../src/components/VideoPlayer';
import UsernameSetup from '../src/components/UsernameSetup';

export default function Home() {
  const router = useRouter();
  const { 
    points, walletAddress, isWalletConnected, setWallet, addPoints, dailyEarnings,
    hasCompletedOnboarding, hasAcceptedTerms, completeOnboarding, acceptTerms, userLevel,
    disconnectWallet, username, setUsername, xummPayloadId, setXummPayloadId
  } = useStore();
  
  const [xrpPrice, setXrpPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const pollingRef = useRef(false);

  const DAILY_CAP = 500;
  const AD_REVENUE_CENTS = 5;

  useEffect(() => {
    fetchPrice();
  }, []);

  useEffect(() => {
    if (!showSplash && !hasCompletedOnboarding) {
    }
    if (!showSplash && hasCompletedOnboarding && !hasAcceptedTerms) {
      setShowAcknowledgment(true);
    }
  }, [showSplash, hasCompletedOnboarding, hasAcceptedTerms]);

  const fetchPrice = async () => {
    const price = await getXRPPrice();
    setXrpPrice(price);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowAcknowledgment(true);
  };

  const handleAcceptTerms = () => {
    acceptTerms();
    setShowAcknowledgment(false);
  };

  const handleConnectWallet = async () => {
    if (pollingRef.current) return;
    
    setLoading(true);
    setConnectionStatus('Initializing connection...');
    
    try {
      const result = await createSignInRequest();
      
      if (!result.success) {
        Alert.alert('Connection Error', result.error || 'Failed to create sign-in request');
        setLoading(false);
        setConnectionStatus('');
        return;
      }
      
      if (result.payloadId) {
        setXummPayloadId(result.payloadId);
        setConnectionStatus('Open Xaman app and approve the sign-in request...');
        
        pollingRef.current = true;
        
        const pollResult = await pollForSignIn(
          result.payloadId,
          (status) => setConnectionStatus(status),
          60
        );
        
        pollingRef.current = false;
        
        if (pollResult.success && pollResult.address) {
          setWallet(pollResult.address);
          Alert.alert('Success', 'Wallet connected successfully!');
          
          if (!username) {
            setTimeout(() => setShowUsernameSetup(true), 500);
          }
        } else {
          Alert.alert('Connection Failed', pollResult.error || 'Could not connect wallet');
        }
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      Alert.alert('Error', error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
      setConnectionStatus('');
      pollingRef.current = false;
    }
  };

  const handleWatchAd = () => {
    if (dailyEarnings >= DAILY_CAP) {
      Alert.alert('Limit Reached', 'You have reached your daily earning limit. Come back tomorrow!');
      return;
    }
    setShowVideoPlayer(true);
  };

  const handleVideoComplete = (reward: number) => {
    addPoints(reward);
    setShowVideoPlayer(false);
    Alert.alert('Reward Earned!', `You earned ${reward} points!`);
  };

  const handleVideoCancel = () => {
    setShowVideoPlayer(false);
    Alert.alert('Cancelled', 'You must watch the full video to earn points.');
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
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'Payout request sent! (Testnet)') }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? You can reconnect anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => {
          disconnectWallet();
          Alert.alert('Disconnected', 'Your wallet has been disconnected.');
        }}
      ]
    );
  };

  const userRewardEstimate = Math.round(AD_REVENUE_CENTS * 0.15);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <View style={styles.wrapper}>
      <AcknowledgmentPopup visible={showAcknowledgment} onAccept={handleAcceptTerms} />
      <VideoPlayer 
        visible={showVideoPlayer} 
        onComplete={handleVideoComplete} 
        onCancel={handleVideoCancel}
        adRevenue={AD_REVENUE_CENTS / 100}
      />
      <UsernameSetup
        visible={showUsernameSetup}
        currentUsername={username}
        onSave={setUsername}
        onClose={() => setShowUsernameSetup(false)}
      />

      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuOpen(false)} activeOpacity={1}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/learn'); }}>
              <MaterialCommunityIcons name="school" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Learn Crypto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/referral'); }}>
              <MaterialCommunityIcons name="account-group" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Referral Program</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/badges'); }}>
              <MaterialCommunityIcons name="medal" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Badges & Levels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/leaderboard'); }}>
              <MaterialCommunityIcons name="podium" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Leaderboard</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/legal'); }}>
              <MaterialCommunityIcons name="shield-check" size={22} color="#868e96" />
              <Text style={styles.menuText}>Legal Disclaimers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/terms'); }}>
              <MaterialCommunityIcons name="file-document" size={22} color="#868e96" />
              <Text style={styles.menuText}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ADFI</Text>
            <Text style={styles.subtitle}>Earn XRP for micro-tasks</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <MaterialCommunityIcons name="menu" size={28} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons 
              name={userLevel === 'Gold' ? 'trophy' : userLevel === 'Silver' ? 'medal-outline' : 'medal'} 
              size={16} 
              color={userLevel === 'Gold' ? '#f59f00' : userLevel === 'Silver' ? '#868e96' : '#cd7f32'} 
            />
            <Text style={styles.levelText}>{userLevel} Member</Text>
          </View>
          {isWalletConnected && (
            <TouchableOpacity style={styles.profileButton} onPress={() => setShowUsernameSetup(true)}>
              <MaterialCommunityIcons name="account-edit" size={16} color="#4dabf7" />
              <Text style={styles.profileButtonText}>
                {username || (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Set Username')}
              </Text>
            </TouchableOpacity>
          )}
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
              <Text style={styles.taskReward}>+{userRewardEstimate} Points</Text>
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
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <MaterialCommunityIcons name="logout" size={18} color="#868e96" />
                  <Text style={styles.logoutText}>Disconnect Wallet</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet} disabled={loading}>
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={[styles.buttonText, { marginLeft: 10 }]}>Connecting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Connect with Xaman</Text>
                  )}
                </TouchableOpacity>
                {connectionStatus ? (
                  <Text style={styles.connectionStatus}>{connectionStatus}</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Current XRP Price: ${xrpPrice?.toFixed(4) || 'Loading...'}</Text>
          <Text style={styles.infoText}>Daily Earnings: ${(dailyEarnings / 100).toFixed(2)} / $5.00</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, marginTop: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666' },
  menuButton: { padding: 8 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  levelText: { marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#495057' },
  profileButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e7f5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  profileButtonText: { marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#4dabf7' },
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
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 10 },
  logoutText: { color: '#868e96', fontSize: 14, marginLeft: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  connectionStatus: { fontSize: 12, color: '#4dabf7', textAlign: 'center', marginTop: 10 },
  infoCard: { padding: 15, backgroundColor: '#e9ecef', borderRadius: 12, marginTop: 20 },
  infoText: { fontSize: 12, color: '#495057', textAlign: 'center', marginVertical: 2 },
  progressBarBg: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4, marginTop: 15, marginBottom: 5 },
  progressBarFill: { height: '100%', backgroundColor: '#4dabf7', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#868e96', textAlign: 'right' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 20 },
  menu: { backgroundColor: '#fff', borderRadius: 15, padding: 10, width: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
  menuText: { marginLeft: 12, fontSize: 15, color: '#1a1a1a' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
});
