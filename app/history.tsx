import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, THEME_CONFIGS } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

export default function HistoryScreen() {
  const { theme, points, totalEarned, history, redemptions } = useStore();
  const themeConfig = THEME_CONFIGS[theme];
  const isDark = themeConfig.isDark;

  const getItemIcon = (type: string, source: string, status?: string) => {
    if (type === 'redemption') {
      if (status === 'completed') return 'check-circle';
      if (status === 'processing') return 'clock-outline';
      if (status === 'failed') return 'alert-circle';
      return 'clock-outline';
    }
    if (type === 'purchase') return 'shopping';
    if (source.includes('Video')) return 'play-circle';
    if (source.includes('Share')) return 'share-variant';
    if (source.includes('Badge')) return 'medal';
    if (source.includes('Referral')) return 'account-group';
    return 'water';
  };

  const getItemColor = (type: string, status?: string) => {
    if (type === 'redemption') {
      if (status === 'completed') return '#40c057';
      if (status === 'processing') return '#f59f00';
      if (status === 'failed') return '#fa5252';
      return '#f59f00';
    }
    if (type === 'purchase') return '#7c3aed';
    return '#40c057';
  };

  const formatAmount = (item: any) => {
    if (item.type === 'redemption') {
      return `-${item.amount} drips`;
    }
    if (item.type === 'purchase') {
      return `-${item.amount} drips`;
    }
    return `+${item.amount} drips`;
  };

  const getStatusText = (status?: string) => {
    if (!status) return '';
    if (status === 'pending') return ' (Pending)';
    if (status === 'processing') return ' (Processing)';
    if (status === 'completed') return ' (Completed)';
    if (status === 'failed') return ' (Failed)';
    return '';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.background }]}>
      <AppHeader title="History" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: themeConfig.card }]}>
            <MaterialCommunityIcons name="wallet" size={28} color={themeConfig.primary} />
            <Text style={[styles.statValue, { color: themeConfig.primary }]}>{points.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: themeConfig.textMuted }]}>Available Drips</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeConfig.card }]}>
            <MaterialCommunityIcons name="chart-line" size={28} color="#40c057" />
            <Text style={[styles.statValue, styles.totalValue, { color: themeConfig.text }]}>{(totalEarned || 0).toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: themeConfig.textMuted }]}>Total Earned</Text>
          </View>
        </View>

        {redemptions && redemptions.length > 0 && (
          <View style={[styles.redemptionsSummary, { backgroundColor: themeConfig.card }]}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#40c057" />
            <View style={styles.redemptionInfo}>
              <Text style={[styles.redemptionTitle, { color: themeConfig.text }]}>Redemptions</Text>
              <Text style={[styles.redemptionSubtitle, { color: themeConfig.textMuted }]}>
                {redemptions.length} total • Processed by CoinGate
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Recent Activity</Text>

        {history.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: themeConfig.card }]}>
            <MaterialCommunityIcons name="history" size={48} color={themeConfig.textMuted} />
            <Text style={[styles.emptyText, { color: themeConfig.textMuted }]}>No activity yet</Text>
            <Text style={[styles.emptySubtext, { color: themeConfig.textMuted }]}>
              Complete tasks to start earning drips!
            </Text>
          </View>
        ) : (
          <View style={[styles.historyCard, { backgroundColor: themeConfig.card }]}>
            {history.slice(0, 50).map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.historyRow,
                  index !== history.slice(0, 50).length - 1 && styles.historyRowBorder,
                  { borderBottomColor: themeConfig.background }
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: getItemColor(item.type, item.status) + '20' }]}>
                  <MaterialCommunityIcons 
                    name={getItemIcon(item.type, item.source, item.status) as any} 
                    size={20} 
                    color={getItemColor(item.type, item.status)} 
                  />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historySource, { color: themeConfig.text }]}>
                    {item.source}{getStatusText(item.status)}
                  </Text>
                  <Text style={[styles.historyDate, { color: themeConfig.textMuted }]}>{item.date}</Text>
                  {item.xrpAmount && (
                    <Text style={[styles.xrpAmount, { color: themeConfig.primary }]}>~{item.xrpAmount.toFixed(6)} XRP</Text>
                  )}
                  {item.transactionId && (
                    <Text style={[styles.transactionId, { color: themeConfig.textMuted }]}>ID: {item.transactionId}</Text>
                  )}
                </View>
                <Text style={[
                  styles.historyAmount,
                  { color: getItemColor(item.type, item.status) }
                ]}>
                  {formatAmount(item)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.infoBox, { backgroundColor: isDark ? themeConfig.card : '#e7f5ff' }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={themeConfig.accent} />
          <Text style={[styles.infoText, { color: isDark ? themeConfig.textMuted : '#1971c2' }]}>
            Redemption payouts are processed by CoinGate and typically take 1-3 business days. Transaction IDs are provided for tracking.
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
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardDark: { backgroundColor: '#252542' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4dabf7', marginTop: 8 },
  totalValue: { color: '#40c057' },
  statLabel: { fontSize: 12, color: '#868e96', marginTop: 4 },
  textDark: { color: '#fff' },
  textMuted: { color: '#a0a0a0' },
  redemptionsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  redemptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  redemptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  redemptionSubtitle: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 15 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#868e96', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#adb5bd', textAlign: 'center', marginTop: 8 },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  historyRowDark: {
    borderBottomColor: '#3a3a5a',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: { flex: 1, marginLeft: 12 },
  historySource: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  historyDate: { fontSize: 12, color: '#868e96', marginTop: 2 },
  xrpAmount: {
    fontSize: 11,
    color: '#4dabf7',
    marginTop: 2,
  },
  transactionId: {
    fontSize: 10,
    color: '#868e96',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  historyAmount: { fontSize: 16, fontWeight: 'bold' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f5ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoBoxDark: { backgroundColor: '#252542' },
  infoText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1971c2', lineHeight: 20 },
  infoTextDark: { color: '#a0a0a0' },
});
