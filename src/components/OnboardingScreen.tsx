import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: 'water',
    title: 'Welcome to droply.io',
    description: 'Earn cryptocurrency by completing simple tasks like watching videos. Your earnings are tracked in drops.',
  },
  {
    icon: 'wallet',
    title: 'Connect Your Wallet',
    description: 'Link your XRP wallet using XUMM (Xaman) to receive payouts. We never hold your private keys.',
  },
  {
    icon: 'play-circle',
    title: 'Complete Tasks',
    description: 'Watch rewarded videos to earn drops. Each video pays based on current ad rates.',
  },
  {
    icon: 'cash-check',
    title: 'Cash Out',
    description: 'Once you reach 500 drops, you can cash out to XRP at the current market rate. Fast and secure!',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <MaterialCommunityIcons name={slide.icon as any} size={100} color="#4dabf7" />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[styles.dot, currentSlide === index && styles.dotActive]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 20,
  },
  skipText: {
    color: '#868e96',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dee2e6',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#4dabf7',
    width: 30,
  },
  nextButton: {
    backgroundColor: '#4dabf7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
