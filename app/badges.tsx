import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, BADGE_REWARDS } from '../src/store/useStore';

const allBadges = [
  { id: 'first_video', name: 'First Steps', description: 'Watch your first video', icon: 'play', unlockPoints: 0 },
  { id: 'bronze', name: 'Bronze Member', description: 'Earn 100 drops', icon: 'medal', unlockPoints: 100 },
  { id: 'silver', name: 'Silver Member', description: 'Earn 500 drops', icon: 'medal-outline', unlockPoints: 500 },
  { id: 'gold', name: 'Gold Member', description: 'Earn 1000 drops', icon: 'trophy', unlockPoints: 1000 },
  { id: 'first_cashout', name: 'First Cashout', description: 'Complete your first payout', icon: 'cash-check', unlockPoints: 500 },
  { id: 'referrer', name: 'Referrer', description: 'Refer your first friend', icon: 'account-group', unlockPoints: 0 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Login 7 days in a row', icon: 'fire', unlockPoints: 0 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Login 30 days in a row', icon: 'crown', unlockPoints: 0 },
];

export default function BadgesScreen() {
  const { badges, badgeRewards, points, userLevel, claimBadgeReward, addBadge } = useStore();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<typeof allBadges[0] | null>(null);
  const [previousPoints, setPreviousPoints] = useState(points);

  useEffect(() => {
    checkForNewBadges();
    setPreviousPoints(points);
  }, [points]);

  const checkForNewBadges = () => {
    allBadges.forEach(badge => {
      if (badge.unlockPoints > 0 && points >= badge.unlockPoints && previousPoints < badge.unlockPoints) {
        if (!badges.includes(badge.id)) {
          addBadge(badge.id);
          setUnlockedBadge(badge);
          setShowUnlockModal(true);
        }
      }
    });
  };

  const isUnlocked = (badge: typeof allBadges[0]) => {
    if (badge.unlockPoints > 0) {
      return points >= badge.unlockPoints;
    }
    return badges.includes(badge.id);
  };

  const getBadgeReward = (badgeId: string) => {
    return badgeRewards.find(br => br.id === badgeId);
  };

  const canClaim = (badgeId: string) => {
    const reward = getBadgeReward(badgeId);
    return reward && !reward.claimed;
  };

  const handleClaimReward = (badge: typeof allBadges[0]) => {
    const reward = claimBadgeReward(badge.id);
    if (reward > 0) {
      Alert.alert(
        'Reward Claimed!',
        `You earned ${reward} drops for unlocking "${badge.name}"!`,
        [{ text: 'Awesome!' }]
      );
    }
  };

  const handleBadgePress = (badge: typeof allBadges[0]) => {
    const unlocked = isUnlocked(badge);
    if (!unlocked) {
      if (badge.unlockPoints > 0) {
        Alert.alert('Locked', `Earn ${badge.unlockPoints} drops to unlock this badge.`);
      } else {
        Alert.alert('Locked', `Complete the required action to unlock this badge.`);
      }
      return;
    }

    if (canClaim(badge.id)) {
      Alert.alert(
        'Claim Reward',
        `Tap "Claim" to receive ${BADGE_REWARDS[badge.id]} drops for "${badge.name}"!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Claim', onPress: () => handleClaimReward(badge) }
        ]
      );
    } else {
      const reward = getBadgeReward(badge.id);
      if (reward?.claimed) {
        Alert.alert('Already Claimed', `You already claimed the ${BADGE_REWARDS[badge.id]} drop reward for this badge.`);
      } else {
        Alert.alert(badge.name, badge.description);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Modal visible={showUnlockModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.unlockModal}>
            <MaterialCommunityIcons name="star-circle" size={80} color="#f59f00" />
            <Text style={styles.unlockTitle}>Badge Unlocked!</Text>
            <Text style={styles.unlockBadgeName}>{unlockedBadge?.name}</Text>
            <Text style={styles.unlockDesc}>{unlockedBadge?.description}</Text>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardText}>+{BADGE_REWARDS[unlockedBadge?.id || ''] || 0} Drops</Text>
            </View>
            <TouchableOpacity 
              style={styles.claimButton} 
              onPress={() => {
                if (unlockedBadge) handleClaimReward(unlockedBadge);
                setShowUnlockModal(false);
              }}
            >
              <Text style={styles.claimButtonText}>Claim Reward</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <Text style={styles.pointsLabel}>Drops</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Badges</Text>
      <Text style={styles.sectionSubtitle}>Tap unlocked badges to claim rewards</Text>
      
      <View style={styles.badgesGrid}>
        {allBadges.map((badge) => {
          const unlocked = isUnlocked(badge);
          const claimable = canClaim(badge.id);
          const reward = getBadgeReward(badge.id);
          return (
            <TouchableOpacity 
              key={badge.id} 
              style={[
                styles.badgeCard, 
                !unlocked && styles.badgeCardLocked,
                claimable && styles.badgeCardClaimable
              ]}
              onPress={() => handleBadgePress(badge)}
            >
              {claimable && (
                <View style={styles.claimBadge}>
                  <Text style={styles.claimBadgeText}>CLAIM</Text>
                </View>
              )}
              <View style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>
                <MaterialCommunityIcons 
                  name={badge.icon as any} 
                  size={32} 
                  color={unlocked ? '#4dabf7' : '#ced4da'} 
                />
              </View>
              <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
              <View style={styles.rewardRow}>
                <MaterialCommunityIcons name="gift" size={14} color={reward?.claimed ? '#40c057' : '#f59f00'} />
                <Text style={[styles.rewardAmount, reward?.claimed && styles.rewardClaimed]}>
                  {reward?.claimed ? 'Claimed' : `+${BADGE_REWARDS[badge.id]} drps`}
                </Text>
              </View>
              {!unlocked && badge.unlockPoints > 0 && (
                <Text style={styles.unlockText}>{badge.unlockPoints} drps to unlock</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10, marginBottom: 5 },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 15,
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 5 },
  sectionSubtitle: { fontSize: 13, color: '#868e96', marginBottom: 15 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    position: 'relative',
  },
  badgeCardLocked: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef' },
  badgeCardClaimable: { borderWidth: 2, borderColor: '#f59f00' },
  claimBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f59f00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  claimBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
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
  rewardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rewardAmount: { fontSize: 12, color: '#f59f00', fontWeight: '600', marginLeft: 4 },
  rewardClaimed: { color: '#40c057' },
  unlockText: { fontSize: 10, color: '#4dabf7', marginTop: 6, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unlockModal: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  unlockTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginTop: 15 },
  unlockBadgeName: { fontSize: 20, fontWeight: '600', color: '#4dabf7', marginTop: 5 },
  unlockDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
  rewardBox: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  rewardText: { fontSize: 20, fontWeight: 'bold', color: '#f59f00' },
  claimButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  claimButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
