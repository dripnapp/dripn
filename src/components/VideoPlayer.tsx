import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VideoPlayerProps {
  visible: boolean;
  onComplete: (reward: number) => void;
  onCancel: () => void;
  adRevenue: number;
}

const getValueTier = (): { tier: 'standard' | 'premium'; duration: number; estimatedCents: number; reward: number } => {
  const random = Math.random();
  if (random < 0.6) {
    return { tier: 'standard', duration: 10 + Math.floor(Math.random() * 6), estimatedCents: 5, reward: 100 };
  } else {
    return { tier: 'premium', duration: 20 + Math.floor(Math.random() * 11), estimatedCents: 12, reward: 200 };
  }
};

export default function VideoPlayer({ visible, onComplete, onCancel, adRevenue }: VideoPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentAd, setCurrentAd] = useState(() => getValueTier());

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      setCompleted(false);
      setCurrentAd(getValueTier());
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= currentAd.duration) {
          clearInterval(interval);
          setCompleted(true);
          return currentAd.duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const userReward = currentAd.reward;

  const handleClose = () => {
    if (completed) {
      onComplete(userReward);
    } else {
      onCancel();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Rewarded Video</Text>
            {!completed && (
              <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#868e96" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.videoArea}>
            <MaterialCommunityIcons name="water" size={80} color="#4dabf7" />
            <Text style={styles.videoText}>Video Ad Playing...</Text>
            <Text style={styles.timerText}>{currentAd.duration - progress}s remaining</Text>
            <Text style={styles.tierText}>{currentAd.tier === 'premium' ? 'Premium Ad' : 'Standard Ad'}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(progress / currentAd.duration) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completed ? 'Video Complete!' : 'Watch the full video to earn drips'}
            </Text>
          </View>

          {completed && (
            <View style={styles.rewardSection}>
              <MaterialCommunityIcons name="check-circle" size={50} color="#2f9e44" />
              <Text style={styles.rewardTitle}>You Earned!</Text>
              <Text style={styles.rewardAmount}>{userReward} Drips</Text>
              <TouchableOpacity style={styles.claimButton} onPress={handleClose}>
                <Text style={styles.claimButtonText}>Claim Reward</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 5,
  },
  videoArea: {
    height: 200,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  timerText: {
    color: '#868e96',
    fontSize: 14,
    marginTop: 5,
  },
  tierText: {
    color: '#4dabf7',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4dabf7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#868e96',
    textAlign: 'center',
    marginTop: 10,
  },
  rewardSection: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 10,
  },
  rewardAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4dabf7',
    marginTop: 5,
  },
  rewardSubtext: {
    fontSize: 14,
    color: '#868e96',
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: '#2f9e44',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
