import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import DroplyLogo from './DroplyLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  const logoWidth = Math.min(screenWidth * 0.8, 400);
  const logoHeight = logoWidth * (260 / 900);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <DroplyLogo width={logoWidth} height={logoHeight} showText={true} />
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
  subtitle: {
    fontSize: 16,
    color: '#868e96',
    marginTop: 20,
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
