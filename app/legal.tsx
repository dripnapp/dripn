import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

export default function LegalScreen() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  
  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.header, isDark && styles.textDark]}>Legal Disclaimers</Text>

      <View style={styles.warningBox}>
        <MaterialCommunityIcons name="alert-circle" size={24} color="#e03131" />
        <Text style={styles.warningText}>Important: Please read all disclaimers carefully before using droply.io.</Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Cryptocurrency Risk Disclosure</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          Cryptocurrency investments are subject to high market risk. The value of XRP and other cryptocurrencies can fluctuate significantly. Past performance is not indicative of future results. You should only transact with cryptocurrency if you understand the risks involved and can afford potential losses.
        </Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>No Financial Advice</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          droply.io does not provide financial, investment, tax, or legal advice. The information provided in this app is for general informational purposes only. You should consult with a qualified professional before making any financial decisions.
        </Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Non-Custodial Service</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          droply.io operates as a non-custodial service. We do not hold, store, or have access to your private keys or funds. You are solely responsible for the security of your wallet and private keys.
        </Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Payout Disclaimer</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          All payouts are made in XRP at the current market rate at the time of the transaction. Due to price volatility, the USD equivalent value of your payout may differ from your point balance. Network fees may apply.
        </Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Age Requirement</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          You must be at least 18 years of age to use droply.io. By using this app, you confirm that you meet this age requirement and are legally permitted to engage in cryptocurrency transactions in your jurisdiction.
        </Text>
      </View>

      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Regulatory Compliance</Text>
        <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
          Cryptocurrency regulations vary by jurisdiction. It is your responsibility to ensure compliance with all applicable laws and regulations in your country or region.
        </Text>
      </View>

      <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  containerDark: { backgroundColor: '#1a1a2e' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10, marginBottom: 20 },
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
