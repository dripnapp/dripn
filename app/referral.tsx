import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

export default function ReferralScreen() {
  const { referralCode, referralCount, enteredReferralCode, referralBonusEarned, enterReferralCode } = useStore();
  const [inputCode, setInputCode] = useState('');

  const copyCode = () => {
    Alert.alert('Copied!', 'Your referral code has been copied to clipboard');
  };

  const handleEnterCode = () => {
    if (!inputCode.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }
    const success = enterReferralCode(inputCode.trim().toUpperCase());
    if (success) {
      Alert.alert('Success!', 'Referral code applied! You and your referrer will both earn bonus rewards.');
      setInputCode('');
    } else {
      if (enteredReferralCode) {
        Alert.alert('Already Applied', 'You have already entered a referral code.');
      } else {
        Alert.alert('Invalid Code', 'Please check the code and try again. You cannot use your own code.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Referral Program</Text>
      <Text style={styles.subheader}>Invite friends and earn together!</Text>

      {!enteredReferralCode && (
        <View style={styles.enterCodeCard}>
          <Text style={styles.enterCodeLabel}>Have a referral code?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter code (e.g. ADFI-ABC123)"
              placeholderTextColor="#999"
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleEnterCode}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {enteredReferralCode && (
        <View style={styles.appliedCard}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#40c057" />
          <View style={styles.appliedContent}>
            <Text style={styles.appliedLabel}>Referral Applied</Text>
            <Text style={styles.appliedCode}>{enteredReferralCode}</Text>
          </View>
        </View>
      )}

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{referralCode || 'ADFI-XXXXXX'}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyCode}>
            <MaterialCommunityIcons name="content-copy" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.codeHint}>Share this code with friends</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{referralCount}</Text>
          <Text style={styles.statLabel}>Friends Referred</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{referralBonusEarned}</Text>
          <Text style={styles.statLabel}>Bonus Points</Text>
        </View>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Code</Text>
            <Text style={styles.stepDesc}>Send your unique referral code to friends and family</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>They Sign Up</Text>
            <Text style={styles.stepDesc}>Your friend downloads ADFI and enters your code</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>You Both Earn</Text>
            <Text style={styles.stepDesc}>Get 10% of their earnings for 30 days</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#4dabf7" />
        <Text style={styles.infoText}>
          Referral bonuses are paid in points and can be cashed out once you reach the minimum threshold.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
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
