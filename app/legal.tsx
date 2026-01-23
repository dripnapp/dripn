import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function LegalScreen() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AppHeader title="Legal" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#e03131" />
          <Text style={styles.warningText}>Important: Please read all disclaimers carefully before using Drip'n.</Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Third-Party Payment Processing</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            All cryptocurrency redemptions and payouts are processed by CoinGate, a licensed third-party payment processor. Drip'n does not hold, custody, or transfer funds. Drip'n does not have access to your private keys and does not sign any cryptocurrency transactions. CoinGate is solely responsible for executing all XRP transfers to your wallet.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Cryptocurrency Risk Disclosure</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Cryptocurrency values are subject to high market volatility. The value of XRP and other cryptocurrencies can fluctuate significantly. The XRP amount you receive during redemption is determined by real-time market rates at the time of processing. Past performance is not indicative of future results.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>No Financial Advice</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Drip'n does not provide financial, investment, tax, or legal advice. The information provided in this app is for general informational purposes only. You should consult with a qualified professional before making any financial decisions.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Redemption Process</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            When you submit a redemption request, Drip'n sends your request to CoinGate. CoinGate then processes the conversion from your drip value to XRP at current market rates and sends the XRP directly to your connected wallet address. Processing typically takes 1-3 business days. Once submitted, redemption requests cannot be cancelled.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Wallet Responsibility</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            You are solely responsible for providing a valid XRP wallet address and maintaining access to your wallet. Drip'n and CoinGate are not responsible for funds sent to incorrect wallet addresses or wallets you no longer have access to.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Age Requirement</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            You must be at least 18 years of age to use Drip'n and redeem drips for cryptocurrency. By using this app, you confirm that you meet this age requirement and are legally permitted to receive cryptocurrency in your jurisdiction.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Regulatory Compliance</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Cryptocurrency regulations vary by jurisdiction. It is your responsibility to ensure compliance with all applicable laws and regulations in your country or region regarding receiving cryptocurrency.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>About CoinGate</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            CoinGate is a licensed cryptocurrency payment processor that handles all Drip'n redemption payouts. For questions about specific transactions or payout status, transaction IDs provided during redemption can be used to track payments. CoinGate's terms and conditions apply to all redemption transactions.
          </Text>
        </View>

        <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
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
  sectionDark: { backgroundColor: '#252542' },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#c92a2a',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#868e96',
    textAlign: 'center',
    marginVertical: 30,
  },
});
