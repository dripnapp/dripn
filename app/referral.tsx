import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, THEME_CONFIGS } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function ReferralScreen() {
  const { referralCode, referralEarnings, fetchReferralStats, theme, setReferralCode, referrerId } = useStore();
  const themeConfig = THEME_CONFIGS[theme];
  const isDark = themeConfig.isDark;
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const handleShareReferral = async () => {
    if (!referralCode) return;
    try {
      await Share.share({
        message: `Join me on Drip'n and start earning crypto rewards! Use my code ${referralCode} to get started. https://dripn.io`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnterCode = async () => {
    if (!inputCode.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }
    setLoading(true);
    const success = await setReferralCode(inputCode.trim().toUpperCase());
    
    if (success) {
      Alert.alert('Success!', 'Referral code applied! You are now connected.');
      setInputCode('');
    } else {
      Alert.alert('Invalid Code', 'Please check the code and try again. You cannot use your own code or reuse codes.');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.background }]}>
      <AppHeader title="Referral Program" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subheader, { color: themeConfig.textMuted }]}>Invite friends and earn together!</Text>

        {!referrerId && (
          <View style={[styles.infoBox, { backgroundColor: isDark ? themeConfig.card : '#fff9db', borderColor: '#fcc419', borderWidth: 1 }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#f08c00" />
            <Text style={[styles.infoText, { color: isDark ? themeConfig.textMuted : '#862e00' }]}>
              Referral codes can only be entered during sign-up. You currently don't have an active referral connection.
            </Text>
          </View>
        )}

        {referrerId && (
          <View style={styles.appliedCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#40c057" />
            <View style={styles.appliedContent}>
              <Text style={styles.appliedLabel}>Referral Applied</Text>
              <Text style={styles.appliedCode}>Status: Connected</Text>
            </View>
          </View>
        )}

        <View style={[styles.codeCard, { backgroundColor: themeConfig.primary }]}>
          <Text style={[styles.codeLabel, { color: 'rgba(255,255,255,0.8)' }]}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{referralCode || 'GENERATING...'}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleShareReferral}>
              <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHint}>Share this code with friends</Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: themeConfig.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeConfig.text }]}>30 Days</Text>
            <Text style={[styles.statLabel, { color: themeConfig.textMuted }]}>Bonus Window</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeConfig.background }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeConfig.text }]}>{referralEarnings.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: themeConfig.textMuted }]}>Bonus drips</Text>
          </View>
        </View>

        <View style={[styles.howItWorks, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>How It Works</Text>
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: themeConfig.primary }]}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: themeConfig.text }]}>Share Your Code</Text>
              <Text style={[styles.stepDesc, { color: themeConfig.textMuted }]}>Send your unique referral code to friends and family</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: themeConfig.primary }]}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: themeConfig.text }]}>They Sign Up</Text>
              <Text style={[styles.stepDesc, { color: themeConfig.textMuted }]}>Your friend downloads Drip'n and enters your code</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: themeConfig.primary }]}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: themeConfig.text }]}>You Both Earn</Text>
              <Text style={[styles.stepDesc, { color: themeConfig.textMuted }]}>Get 10% of their earnings for 30 days</Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? themeConfig.card : '#e7f5ff' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color={themeConfig.primary} />
          <Text style={[styles.infoText, { color: isDark ? themeConfig.textMuted : '#1971c2' }]}>
            Referral bonuses are paid in drips and can be cashed out once you reach the minimum threshold.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#1a1a2e' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  textDark: { color: '#fff' },
  textMuted: { color: '#a0a0a0' },
  cardDark: { backgroundColor: '#252542' },
  infoBoxDark: { backgroundColor: '#252542' },
  infoTextDark: { color: '#a0a0a0' },
  subheader: { fontSize: 14, color: '#666', marginBottom: 25 },
  enterCodeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4dabf7',
    borderStyle: 'dashed',
  },
  enterCodeLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
  },
  applyButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  appliedCard: {
    backgroundColor: '#d3f9d8',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedContent: { marginLeft: 12 },
  appliedLabel: { fontSize: 12, color: '#2f9e44', textTransform: 'uppercase', letterSpacing: 1 },
  appliedCode: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginTop: 2 },
  codeCard: {
    backgroundColor: '#4dabf7',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  code: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  copyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    marginLeft: 15,
  },
  codeHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 10 },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 25,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#eee' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  howItWorks: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 20 },
  step: { flexDirection: 'row', marginBottom: 20 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: { color: '#fff', fontWeight: 'bold' },
  stepContent: { flex: 1, marginLeft: 15 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  stepDesc: { fontSize: 14, color: '#666', marginTop: 3 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f5ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#1971c2', lineHeight: 20 },
});
