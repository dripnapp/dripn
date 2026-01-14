import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DroplyLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  iconOnly?: boolean;
  textColor?: string;
}

export default function DroplyLogo({ 
  width = 200, 
  height = 58, 
  showText = true,
  iconOnly = false,
  textColor = '#FFFFFF'
}: DroplyLogoProps) {
  const iconSize = iconOnly ? Math.min(width, height) : height * 0.85;
  const fontSize = height * 0.55;

  if (iconOnly) {
    return (
      <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
        <DropIcon size={iconSize} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <DropIcon size={iconSize} />
      {showText && (
        <Text style={[styles.wordmark, { fontSize, color: textColor }]}>droply.io</Text>
      )}
    </View>
  );
}

export function DropIcon({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.dropContainer, { width: size, height: size }]}>
      <MaterialCommunityIcons 
        name="water" 
        size={size} 
        color="#4dabf7" 
      />
      <View style={styles.playOverlay}>
        <MaterialCommunityIcons 
          name="play" 
          size={size * 0.4} 
          color="#FFFFFF" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '25%',
    left: '30%',
  },
  wordmark: {
    fontWeight: '500',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
});
