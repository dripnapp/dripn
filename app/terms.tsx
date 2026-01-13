import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Terms of Use</Text>
      <Text style={styles.effectiveDate}>Effective Date: January 2026</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.sectionContent}>
          By accessing or using ADFI ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.sectionContent}>
          You must be at least 18 years old to use ADFI. By using the App, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
        <Text style={styles.sectionContent}>
          You are responsible for maintaining the confidentiality of your wallet and account information. You agree to accept responsibility for all activities that occur under your account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Earning Points</Text>
        <Text style={styles.sectionContent}>
          Points are earned by completing designated tasks such as watching rewarded videos. Point values are determined by actual ad revenue, with users receiving 15% of the revenue generated. Daily earning caps may apply to prevent abuse.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Cashouts and Payouts</Text>
        <Text style={styles.sectionContent}>
          Points may be cashed out for XRP cryptocurrency once the minimum threshold is reached. Payouts are processed at the current XRP market rate. We reserve the right to delay or deny payouts in cases of suspected fraud.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Prohibited Activities</Text>
        <Text style={styles.sectionContent}>
          You agree not to: use bots or automated systems, create multiple accounts, exploit bugs or glitches, engage in fraudulent activity, or violate any applicable laws while using the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Referral Program</Text>
        <Text style={styles.sectionContent}>
          Referrers earn 10% of their referees' earnings for 30 days after signup. Abuse of the referral program, including self-referrals, will result in account termination.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Modifications</Text>
        <Text style={styles.sectionContent}>
          We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.sectionContent}>
          ADFI is provided "as is" without warranties of any kind. We are not liable for any losses arising from cryptocurrency price fluctuations, network issues, or third-party services.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.sectionContent}>
          For questions about these Terms, please contact us through the App's support channel.
        </Text>
      </View>

      <Text style={styles.footer}>
        By using ADFI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
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
