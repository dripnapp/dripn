import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LearnScreen() {
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
      icon: 'wallet-outline',
      title: 'What is a Crypto Wallet?',
      content: 'A crypto wallet is a tool that allows you to interact with blockchain networks. It stores your private keys (not actual coins) and lets you send, receive, and manage your cryptocurrency.',
    },
    {
      icon: 'shield-check',
      title: 'What is Non-Custodial?',
      content: 'Non-custodial means you maintain complete control of your private keys and funds. ADFI never holds your crypto - we only send rewards directly to your connected wallet.',
    },
    {
      icon: 'chart-line-variant',
      title: 'Understanding Volatility',
      content: 'Cryptocurrency prices can change rapidly. The XRP you receive today might be worth more or less tomorrow. Always consider this when planning cashouts.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Crypto Basics</Text>
      <Text style={styles.subheader}>Learn the fundamentals of cryptocurrency and XRP</Text>

      {topics.map((topic, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={topic.icon as any} size={28} color="#4dabf7" />
            <Text style={styles.cardTitle}>{topic.title}</Text>
          </View>
          <Text style={styles.cardContent}>{topic.content}</Text>
        </View>
      ))}

      <View style={styles.tipBox}>
        <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#f59f00" />
        <Text style={styles.tipText}>
          Pro Tip: Never share your wallet's secret key with anyone, including ADFI. We will never ask for it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
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
