import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';

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

  const logoWidth = Math.min(screenWidth * 1.0, 600);
  const logoHeight = logoWidth * 0.4;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo-cropped.jpg')}
          style={{ width: logoWidth, height: logoHeight }}
          contentFit="contain"
        />
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
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingText: {
    color: '#868e96',
    fontSize: 14,
  },
});
