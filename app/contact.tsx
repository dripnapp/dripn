import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, THEME_CONFIGS } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function ContactScreen() {
  const { theme } = useStore();
  const themeConfig = THEME_CONFIGS[theme];
  const isDark = themeConfig.isDark;

  const handleEmailPress = () => {
    Linking.openURL("mailto:dripnapp@proton.me?subject=Drip'n Support Request");
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.background }]}>
      <AppHeader title="Contact Us" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: themeConfig.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: themeConfig.background }]}>
            <MaterialCommunityIcons name="email-outline" size={48} color={themeConfig.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: themeConfig.text }]}>Email Support</Text>
          <Text style={[styles.cardDesc, { color: themeConfig.textMuted }]}>
            For questions, issues, or feedback, reach out to our support team via email.
          </Text>
          <TouchableOpacity style={[styles.emailButton, { backgroundColor: themeConfig.primary }]} onPress={handleEmailPress}>
            <MaterialCommunityIcons name="email-fast" size={20} color="#fff" />
            <Text style={styles.emailButtonText}>dripnapp@proton.me</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.infoTitle, { color: themeConfig.text }]}>What to Include</Text>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#40c057" />
            <Text style={[styles.infoText, { color: themeConfig.textMuted }]}>Your username or email address attached to your account</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#40c057" />
            <Text style={[styles.infoText, { color: themeConfig.textMuted }]}>A clear description of your issue or question</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#40c057" />
            <Text style={[styles.infoText, { color: themeConfig.textMuted }]}>Screenshots if applicable (optional)</Text>
          </View>
        </View>

        <View style={[styles.responseCard, { backgroundColor: themeConfig.card }]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#f59f00" />
          <View style={styles.responseContent}>
            <Text style={[styles.responseTitle, { color: themeConfig.text }]}>Response Time</Text>
            <Text style={[styles.responseText, { color: themeConfig.textMuted }]}>
              We typically respond within 24-48 hours during business days.
            </Text>
          </View>
        </View>

        <View style={[styles.tipBox, { backgroundColor: isDark ? themeConfig.card : '#e7f5ff' }]}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color={themeConfig.primary} />
          <Text style={[styles.tipText, { color: isDark ? themeConfig.textMuted : '#1971c2' }]}>
            Before contacting support, check our Learn section and Terms of Use for common questions.
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardDark: { backgroundColor: '#252542' },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 21 },
  emailButton: {
    backgroundColor: '#4dabf7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emailButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 15 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#495057', lineHeight: 20 },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  responseContent: { flex: 1, marginLeft: 15 },
  responseTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  responseText: { fontSize: 13, color: '#666', marginTop: 4 },
  tipBox: {
    backgroundColor: '#e7f5ff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  tipText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1971c2', lineHeight: 19 },
});
