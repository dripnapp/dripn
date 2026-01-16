import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

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
      content: "Drip'n is a rewards app where you earn \"drips\" by completing simple tasks like watching short videos. Drips are an in-app reward currency used to track your progress and achievements within the app.",
      isDripn: true,
      disclaimer: "Important: Drips earned on Drip'n have no monetary value, cash value, or real-world currency equivalent. They are virtual rewards for entertainment purposes only and cannot be exchanged for cash or transferred outside the app.",
    },
    {
      icon: 'wallet-outline',
      title: 'What is a Crypto Wallet?',
      content: 'A crypto wallet is a tool that allows you to interact with blockchain networks. It stores your private keys (not actual coins) and lets you send, receive, and manage your cryptocurrency.',
    },
    {
      icon: 'shield-check',
      title: 'What is Non-Custodial?',
      content: "Non-custodial means you maintain complete control of your private keys and funds. Drip'n never holds your crypto - we only send rewards directly to your connected wallet.",
    },
    {
      icon: 'chart-line-variant',
      title: 'Understanding Volatility',
      content: 'Cryptocurrency prices can change rapidly. The XRP you receive today might be worth more or less tomorrow. Always consider this when planning cashouts.',
    },
  ];

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.header, isDark && styles.textDark]}>Crypto Basics</Text>
      <Text style={[styles.subheader, isDark && styles.textMuted]}>Learn the fundamentals of cryptocurrency and XRP</Text>

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
          Pro Tip: Never share your wallet's secret key with anyone, including Drip'n. We will never ask for it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  containerDark: { backgroundColor: '#1a1a2e' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
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
