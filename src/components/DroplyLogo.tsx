import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  const iconSize = iconOnly ? Math.min(width, height) : height * 0.8;
  const fontSize = height * 0.6;

  if (iconOnly) {
    return (
      <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
        <DropIcon size={iconSize} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <DropIcon size={iconSize} />
      {showText && (
        <Text style={[styles.wordmark, { fontSize, color: textColor }]}>droply</Text>
      )}
    </View>
  );
}

export function DropIcon({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.dropContainer, { width: size, height: size }]}>
      <MaterialCommunityIcons 
        name="water" 
        size={size * 0.9} 
        color="#4dabf7" 
      />
      <View style={[styles.playTriangle, { 
        left: size * 0.38,
        top: size * 0.35,
        borderLeftWidth: size * 0.2,
        borderTopWidth: size * 0.12,
        borderBottomWidth: size * 0.12,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  wordmark: {
    fontWeight: '500',
    letterSpacing: -1,
    marginLeft: 8,
  },
});
