import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <View style={styles.dropIcon}>
            <MaterialCommunityIcons name="water" size={60} color="#4dabf7" />
            <View style={styles.playOverlay}>
              <MaterialCommunityIcons name="play" size={24} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>droply</Text>
        </View>
        <Text style={styles.subtitle}>every drop counts</Text>
      </View>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropIcon: {
    position: 'relative',
    marginRight: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -10,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#868e96',
    marginTop: 15,
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingText: {
    color: '#868e96',
    fontSize: 14,
  },
});
