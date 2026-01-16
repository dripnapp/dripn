import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { history, points, totalEarned, theme } = useStore();
  const isDark = theme === 'dark';

  const totalCashouts = history
    .filter(h => h.type === 'cashout')
    .reduce((sum, h) => sum + h.amount, 0);

  const getSourceIcon = (source: string) => {
    if (source.includes('Video')) return 'play-circle';
    if (source.includes('Share')) return 'share-variant';
    if (source.includes('Badge')) return 'medal';
    if (source.includes('Referral')) return 'account-group';
    if (source.includes('Cashout')) return 'cash';
    return 'star';
  };

  const getSourceColor = (type: string) => {
    return type === 'cashout' ? '#e03131' : '#40c057';
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, isDark && styles.cardDark]}>
            <MaterialCommunityIcons name="wallet" size={28} color="#4dabf7" />
            <Text style={[styles.statValue, isDark && styles.textDark]}>{points}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>Available Drips</Text>
          </View>
          <View style={[styles.statCard, isDark && styles.cardDark]}>
            <MaterialCommunityIcons name="chart-line" size={28} color="#40c057" />
            <Text style={[styles.statValue, isDark && styles.textDark]}>{totalEarned || 0}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>Total Earned</Text>
          </View>
        </View>

        <View style={[styles.statCardWide, isDark && styles.cardDark]}>
          <MaterialCommunityIcons name="cash-multiple" size={28} color="#f59f00" />
          <View style={styles.statCardWideContent}>
            <Text style={[styles.statValue, isDark && styles.textDark]}>{totalCashouts}</Text>
            <Text style={[styles.statLabel, isDark && styles.textMuted]}>Total Cashed Out</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Recent Activity</Text>

        {history.length === 0 ? (
          <View style={[styles.emptyCard, isDark && styles.cardDark]}>
            <MaterialCommunityIcons name="history" size={48} color="#868e96" />
            <Text style={[styles.emptyText, isDark && styles.textMuted]}>No activity yet</Text>
            <Text style={[styles.emptySubtext, isDark && styles.textMuted]}>
              Start earning drips by watching videos or sharing the app!
            </Text>
          </View>
        ) : (
          <View style={[styles.historyCard, isDark && styles.cardDark]}>
            {history.slice(0, 50).map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.historyRow,
                  index !== history.slice(0, 50).length - 1 && styles.historyRowBorder,
                  isDark && styles.historyRowDark
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: getSourceColor(item.type) + '20' }]}>
                  <MaterialCommunityIcons 
                    name={getSourceIcon(item.source) as any} 
                    size={20} 
                    color={getSourceColor(item.type)} 
                  />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historySource, isDark && styles.textDark]}>{item.source}</Text>
                  <Text style={[styles.historyDate, isDark && styles.textMuted]}>{item.date}</Text>
                </View>
                <Text style={[
                  styles.historyAmount,
                  { color: getSourceColor(item.type) }
                ]}>
                  {item.type === 'cashout' ? '-' : '+'}{item.amount} drps
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#4dabf7" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Total earned drips are used for leaderboard ranking, so you can cash out while still climbing the ranks!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#1a1a2e' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#12122a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
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
  statCardWide: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statCardWideContent: { marginLeft: 15 },
  cardDark: { backgroundColor: '#252542' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#868e96', marginTop: 4 },
  textDark: { color: '#fff' },
  textMuted: { color: '#a0a0a0' },
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
