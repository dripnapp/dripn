import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function TermsScreen() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AppHeader title="Terms of Use" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.effectiveDate, isDark && styles.textMuted]}>Effective Date: January 2026</Text>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>1. Acceptance of Terms</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            By accessing or using Drip'n ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>2. Eligibility</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            You must be at least 18 years old to use Drip'n. By using the App, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>3. Account Responsibilities</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            You are responsible for maintaining the confidentiality of your wallet address and account information. You agree to accept responsibility for all activities that occur under your account.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>4. Earning Drips</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Drips are earned by completing designated tasks such as watching rewarded videos, completing surveys, and sharing the app. Drip values are determined by actual ad revenue, with users receiving a portion of the revenue generated. Daily earning caps may apply to prevent abuse.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>5. Redemptions and Payouts</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Drips may be redeemed for XRP cryptocurrency once the minimum threshold is reached. All redemptions are processed by CoinGate, a licensed third-party payment processor. CoinGate converts your drip value to XRP at real-time market rates and sends the XRP directly to your connected wallet. Drip'n does not hold, custody, or transfer any funds. Processing takes 1-3 business days. Once submitted, redemption requests cannot be cancelled, re-redeemed, or transferred to another user.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>6. Third-Party Services</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Drip'n uses CoinGate for all cryptocurrency redemption processing. By using the redemption feature, you also agree to CoinGate's terms of service. Drip'n is not responsible for any issues, delays, or disputes arising from CoinGate's services.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>7. Prohibited Activities</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            You agree not to: use bots or automated systems, create multiple accounts, exploit bugs or glitches, engage in fraudulent activity, or violate any applicable laws while using the App.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>8. Referral Program</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Referrers earn 10% of their referees' earnings for 30 days after signup. Abuse of the referral program, including self-referrals, will result in account termination.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>9. Modifications</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>10. Limitation of Liability</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            Drip'n is provided "as is" without warranties of any kind. We are not liable for any losses arising from cryptocurrency price fluctuations, network issues, third-party services (including CoinGate), or incorrect wallet addresses provided by users.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>11. Contact</Text>
          <Text style={[styles.sectionContent, isDark && styles.textMuted]}>
            For questions about these Terms, please contact us at dripnapp@proton.me or through the Contact Us page in the app.
          </Text>
        </View>

        <Text style={styles.footer}>
          By using Drip'n, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
        </Text>
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
  effectiveDate: { fontSize: 14, color: '#666', marginBottom: 25 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 21,
  },
  footer: {
    fontSize: 12,
    color: '#868e96',
    textAlign: 'center',
    marginVertical: 30,
    fontStyle: 'italic',
  },
});
