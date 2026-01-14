import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface DroplyLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  iconOnly?: boolean;
}

export default function DroplyLogo({ 
  width = 200, 
  height = 58, 
  showText = true,
  iconOnly = false 
}: DroplyLogoProps) {
  if (iconOnly) {
    const iconSize = Math.min(width, height);
    return (
      <View style={[styles.container, { width: iconSize, height: iconSize }]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 240 280">
          <Defs>
            <LinearGradient id="dropGradientIcon" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#4F7CFF" />
              <Stop offset="100%" stopColor="#22E6FF" />
            </LinearGradient>
          </Defs>
          <G transform="translate(20, 20)">
            <Path
              d="M100 0
                 C140 60 180 100 180 150
                 C180 205 145 240 100 240
                 C55 240 20 205 20 150
                 C20 100 60 60 100 0Z"
              fill="url(#dropGradientIcon)"
            />
            <Path
              d="M85 95
                 L85 145
                 L130 120
                 Z"
              fill="#FFFFFF"
            />
          </G>
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 900 260">
        <Defs>
          <LinearGradient id="dropGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4F7CFF" />
            <Stop offset="100%" stopColor="#22E6FF" />
          </LinearGradient>
        </Defs>
        
        <G transform="translate(60, 30)">
          <Path
            d="M100 0
               C140 60 180 100 180 150
               C180 205 145 240 100 240
               C55 240 20 205 20 150
               C20 100 60 60 100 0Z"
            fill="url(#dropGradient)"
          />
          <Path
            d="M85 95
               L85 145
               L130 120
               Z"
            fill="#FFFFFF"
          />
        </G>
        
        {showText && (
          <SvgText
            x="300"
            y="165"
            fill="#FFFFFF"
            fontSize="120"
            fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
            fontWeight="500"
            letterSpacing={-2}
          >
            droply
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

export function DropIcon({ size = 24, color = '#4dabf7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 280">
      <Defs>
        <LinearGradient id="dropGradientSmall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4F7CFF" />
          <Stop offset="100%" stopColor="#22E6FF" />
        </LinearGradient>
      </Defs>
      <G transform="translate(20, 20)">
        <Path
          d="M100 0
             C140 60 180 100 180 150
             C180 205 145 240 100 240
             C55 240 20 205 20 150
             C20 100 60 60 100 0Z"
          fill="url(#dropGradientSmall)"
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
