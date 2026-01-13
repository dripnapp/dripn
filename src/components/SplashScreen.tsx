import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
        <MaterialCommunityIcons name="currency-usd" size={80} color="#4dabf7" />
        <Text style={styles.title}>ADFI</Text>
        <Text style={styles.subtitle}>Crypto Pulse Rewards</Text>
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
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#868e96',
    marginTop: 10,
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
