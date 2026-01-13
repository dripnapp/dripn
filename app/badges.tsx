import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

const allBadges = [
  { id: 'first_video', name: 'First Steps', description: 'Watch your first video', icon: 'play', unlockPoints: 0 },
  { id: 'bronze', name: 'Bronze Member', description: 'Earn 100 points', icon: 'medal', unlockPoints: 100 },
  { id: 'silver', name: 'Silver Member', description: 'Earn 500 points', icon: 'medal-outline', unlockPoints: 500 },
  { id: 'gold', name: 'Gold Member', description: 'Earn 1000 points', icon: 'trophy', unlockPoints: 1000 },
  { id: 'first_cashout', name: 'First Cashout', description: 'Complete your first payout', icon: 'cash-check', unlockPoints: 500 },
  { id: 'referrer', name: 'Referrer', description: 'Refer your first friend', icon: 'account-group', unlockPoints: 0 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Login 7 days in a row', icon: 'fire', unlockPoints: 0 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Login 30 days in a row', icon: 'crown', unlockPoints: 0 },
];

export default function BadgesScreen() {
  const { badges, points, userLevel } = useStore();

  const isUnlocked = (badge: typeof allBadges[0]) => {
    if (badge.unlockPoints > 0) {
      return points >= badge.unlockPoints;
    }
    return badges.includes(badge.id);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Badges</Text>
      
      <View style={styles.levelCard}>
        <MaterialCommunityIcons 
          name={userLevel === 'Gold' ? 'trophy' : userLevel === 'Silver' ? 'medal-outline' : 'medal'} 
          size={50} 
          color={userLevel === 'Gold' ? '#f59f00' : userLevel === 'Silver' ? '#868e96' : '#cd7f32'} 
        />
        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Current Level</Text>
          <Text style={styles.levelName}>{userLevel}</Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsNumber}>{points}</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Badges</Text>
      
      <View style={styles.badgesGrid}>
        {allBadges.map((badge) => {
          const unlocked = isUnlocked(badge);
          return (
            <View key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}>
              <View style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>
                <MaterialCommunityIcons 
                  name={badge.icon as any} 
                  size={32} 
                  color={unlocked ? '#4dabf7' : '#ced4da'} 
                />
              </View>
              <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
              {!unlocked && badge.unlockPoints > 0 && (
                <Text style={styles.unlockText}>{badge.unlockPoints} pts to unlock</Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10, marginBottom: 20 },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
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
  levelInfo: { flex: 1, marginLeft: 15 },
  levelLabel: { fontSize: 12, color: '#868e96', textTransform: 'uppercase' },
  levelName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  pointsBox: { alignItems: 'center', backgroundColor: '#f1f3f5', padding: 12, borderRadius: 12 },
  pointsNumber: { fontSize: 20, fontWeight: 'bold', color: '#4dabf7' },
  pointsLabel: { fontSize: 11, color: '#868e96' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 15 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  badgeCardLocked: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef' },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeIconLocked: { backgroundColor: '#f1f3f5' },
  badgeName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },
  badgeNameLocked: { color: '#adb5bd' },
  badgeDesc: { fontSize: 11, color: '#868e96', textAlign: 'center', marginTop: 4 },
  unlockText: { fontSize: 10, color: '#4dabf7', marginTop: 6, fontWeight: '500' },
});
