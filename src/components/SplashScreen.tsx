import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useAssets } from 'expo-asset';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [assets] = useAssets([require('../../assets/images/droply-logo.png')]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {assets && assets[0] ? (
          <Image 
            source={{ uri: assets[0].uri }} 
            style={styles.logoImage}
            contentFit="contain"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>droply</Text>
          </View>
        )}
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
    width: '100%',
  },
  logoImage: {
    width: screenWidth * 0.85,
    height: (screenWidth * 0.85) * (1024 / 1536),
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
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
