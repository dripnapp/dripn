import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

const baseLeaderboard = [
  { username: 'CryptoKing', points: 12450, level: 'Gold' },
  { username: 'XRPHunter', points: 9820, level: 'Gold' },
  { username: 'RewardChaser', points: 7650, level: 'Gold' },
  { username: 'TokenMaster', points: 5430, level: 'Gold' },
  { username: 'BlockExplorer', points: 4210, level: 'Gold' },
  { username: 'CoinCollector', points: 3890, level: 'Gold' },
  { username: 'DigiEarner', points: 2750, level: 'Silver' },
  { username: 'CashFlowPro', points: 1980, level: 'Silver' },
  { username: 'PointsPilot', points: 1540, level: 'Silver' },
  { username: 'RewardRookie', points: 890, level: 'Bronze' },
];

export default function LeaderboardScreen() {
  const { points, userLevel, walletAddress, username } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const displayName = username || (walletAddress ? `${walletAddress.slice(0, 6)}...` : 'You');

  const leaderboardData = useMemo(() => {
    const currentUser = {
      username: displayName,
      points: points,
      level: userLevel,
      isCurrentUser: true,
    };

    const allUsers = [
      ...baseLeaderboard.map(u => ({ ...u, isCurrentUser: false })),
      currentUser,
    ];

    const sorted = allUsers.sort((a, b) => b.points - a.points);
    const ranked = sorted.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return ranked.slice(0, 10);
  }, [points, userLevel, displayName]);

  const userRank = useMemo(() => {
    const allUsers = [
      ...baseLeaderboard.map(u => ({ ...u, isCurrentUser: false })),
      { username: displayName, points, level: userLevel, isCurrentUser: true },
    ];
    const sorted = allUsers.sort((a, b) => b.points - a.points);
    const userIndex = sorted.findIndex(u => u.isCurrentUser);
    return userIndex + 1;
  }, [points, userLevel, displayName]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#f59f00';
    if (rank === 2) return '#868e96';
    if (rank === 3) return '#cd7f32';
    return '#4dabf7';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal-outline';
    return 'numeric';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Leaderboard</Text>
      <Text style={styles.subheader}>Top 10 earners this month</Text>

      <View style={styles.yourRankCard}>
        <View style={styles.yourRankLeft}>
          <Text style={styles.yourRankLabel}>Your Rank</Text>
          <Text style={styles.yourRankNumber}>#{userRank}</Text>
        </View>
        <View style={styles.yourRankRight}>
          <Text style={styles.yourPoints}>{points.toLocaleString()} pts</Text>
          <Text style={styles.yourLevel}>{userLevel}</Text>
        </View>
      </View>

      <View style={styles.leaderboardCard}>
        {leaderboardData.map((user, index) => (
          <View 
            key={index} 
            style={[
              styles.leaderRow, 
              index === 0 && styles.leaderRowFirst,
              user.isCurrentUser && styles.leaderRowCurrentUser
            ]}
          >
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(user.rank) + '20' }]}>
              {user.rank <= 3 ? (
                <MaterialCommunityIcons 
                  name={getRankIcon(user.rank) as any} 
                  size={20} 
                  color={getRankColor(user.rank)} 
                />
              ) : (
                <Text style={[styles.rankNumber, { color: getRankColor(user.rank) }]}>{user.rank}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.username, user.isCurrentUser && styles.usernameCurrentUser]}>
                {user.username}{user.isCurrentUser ? ' (You)' : ''}
              </Text>
              <Text style={styles.userLevel}>{user.level}</Text>
            </View>
            <View style={styles.pointsSection}>
              <Text style={styles.userPoints}>{user.points.toLocaleString()}</Text>
              <Text style={styles.pointsUnit}>pts</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information-outline" size={18} color="#4dabf7" />
        <Text style={styles.infoText}>
          Leaderboard updates live as you earn points. Keep earning to climb the ranks!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
  subheader: { fontSize: 14, color: '#666', marginBottom: 20 },
  yourRankCard: {
    backgroundColor: '#4dabf7',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  yourRankLeft: {},
  yourRankLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase' },
  yourRankNumber: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  yourRankRight: { alignItems: 'flex-end' },
  yourPoints: { color: '#fff', fontSize: 20, fontWeight: '600' },
  yourLevel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  leaderRowFirst: {
    backgroundColor: '#fffbeb',
  },
  leaderRowCurrentUser: {
    backgroundColor: '#e7f5ff',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: { fontSize: 16, fontWeight: 'bold' },
  userInfo: { flex: 1, marginLeft: 12 },
  username: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  usernameCurrentUser: { color: '#4dabf7' },
  userLevel: { fontSize: 12, color: '#868e96', marginTop: 2 },
  pointsSection: { alignItems: 'flex-end' },
  userPoints: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  pointsUnit: { fontSize: 11, color: '#868e96' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f5ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1971c2' },
});
