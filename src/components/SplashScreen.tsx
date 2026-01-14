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

  const logoWidth = Math.min(screenWidth * 0.7, 320);
  const logoHeight = 60;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <DroplyLogo width={logoWidth} height={logoHeight} showText={true} textColor="#FFFFFF" />
        <Text style={styles.subtitle}>"every drop counts"</Text>
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
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#868e96',
    marginTop: 16,
    letterSpacing: 0.5,
    fontStyle: 'italic',
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
