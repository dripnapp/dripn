import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, Image, Platform } from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [dots, setDots] = useState("");

  const handleFinish = useCallback(() => {
    setVisible(false);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [handleFinish]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 400);

    return () => clearInterval(dotInterval);
  }, []);

  if (!visible) return null;

  const logoWidth = Math.min(screenWidth * 0.85, 500);
  const logoHeight = logoWidth * 0.35;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/dripn-logo.jpg")}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading{dots}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 80,
  },
  loadingText: {
    color: "#868e96",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 2,
  },
});
