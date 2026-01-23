import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function LearnScreen() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const topics = [
    {
      icon: 'bitcoin',
      title: 'What is Cryptocurrency?',
      content: 'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. Unlike traditional currencies, cryptocurrencies operate on decentralized networks based on blockchain technology.',
    },
    {
      icon: 'currency-usd',
      title: 'What is XRP?',
      content: 'XRP is the native cryptocurrency of the XRP Ledger (XRPL). It was created by Ripple Labs and is designed for fast, low-cost international payments. Transactions typically settle in 3-5 seconds.',
    },
    {
      icon: 'water',
      title: "What is Drip'n?",
      content: "Drip'n is a rewards app where you earn \"drips\" by completing simple tasks like watching short videos. Once you accumulate enough drips, you can redeem them for XRP cryptocurrency through our third-party payment processor.",
      isDripn: true,
      disclaimer: "Important: When you redeem drips, CoinGate (our third-party payment processor) handles all cryptocurrency transactions. Drip'n does not hold funds, custody crypto, or sign transactions. All payouts are processed and sent by CoinGate directly to your wallet.",
    },
    {
      icon: 'wallet-outline',
      title: 'What is a Crypto Wallet?',
      content: 'A crypto wallet is a tool that allows you to interact with blockchain networks. It stores your private keys (not actual coins) and lets you send, receive, and manage your cryptocurrency. You will need an XRP wallet address to receive redemptions.',
    },
    {
      icon: 'shield-check',
      title: 'How Does Redemption Work?',
      content: "When you redeem drips, your request is sent to CoinGate, a licensed payment processor. CoinGate converts your drips value to XRP at the current market rate and sends the XRP directly to your connected wallet. Drip'n never touches, holds, or transfers the funds.",
    },
    {
      icon: 'chart-line-variant',
      title: 'Understanding Volatility',
      content: 'Cryptocurrency prices can change rapidly. The XRP value at the time of redemption may differ from when you earned your drips. CoinGate uses real-time market rates for all conversions.',
    },
    {
      icon: 'bank-transfer',
      title: 'About CoinGate',
      content: 'CoinGate is a licensed cryptocurrency payment processor that handles all redemption payouts. They provide secure, compliant crypto transactions and are responsible for executing XRP transfers to your wallet.',
    },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AppHeader title="Learn" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subheader, isDark && styles.textMuted]}>Learn about cryptocurrency and how redemptions work</Text>

        {topics.map((topic, index) => (
          <View key={index} style={[styles.card, topic.isDripn && styles.dripnCard, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons 
                name={topic.icon as any} 
                size={28} 
                color={topic.isDripn ? '#22E6FF' : '#4dabf7'} 
              />
              <Text style={[styles.cardTitle, isDark && styles.textDark]}>{topic.title}</Text>
            </View>
            <Text style={[styles.cardContent, isDark && styles.textMuted]}>{topic.content}</Text>
            {topic.disclaimer && (
              <View style={styles.disclaimerBox}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#868e96" />
                <Text style={styles.disclaimerText}>{topic.disclaimer}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={[styles.tipBox, isDark && styles.tipBoxDark]}>
          <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#f59f00" />
          <Text style={[styles.tipText, isDark && styles.textMuted]}>
            Pro Tip: Never share your wallet's secret key with anyone. Drip'n and CoinGate will never ask for your private keys.
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
  subheader: { fontSize: 14, color: '#666', marginBottom: 25 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dripnCard: {
    borderWidth: 1,
    borderColor: '#4dabf7',
    backgroundColor: '#f8fcff',
  },
  cardDark: { backgroundColor: '#252542' },
  tipBoxDark: { backgroundColor: '#252542' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  cardContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f1f3f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#fff9db',
    padding: 15,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#5c5c5c',
    lineHeight: 20,
  },
});
