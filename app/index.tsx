import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Linking,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import { useStore, THEME_CONFIGS } from "../src/store/useStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SplashScreen from "../src/components/SplashScreen";
import OnboardingScreen from "../src/components/OnboardingScreen";
import AcknowledgmentPopup from "../src/components/AcknowledgmentPopup";
import VideoPlayer from "../src/components/VideoPlayer";
import UsernameSetup from "../src/components/UsernameSetup";
import AppHeader from "../src/components/AppHeader";
import RedeemDripsModal from "../src/components/RedeemDripsModal";
import { initializeAds, createRewardedAd, getAdEventTypes } from "../src/utils/ads";

import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const rewardedAdUnitId = __DEV__
  ? "ca-app-pub-3940256099942544/1712485313"
  : "ca-app-pub-4501953262639636/8435825886";

const unityAdUnitId = __DEV__
  ? "ca-app-pub-3940256099942544/1712485313"
  : "ca-app-pub-4501953262639636/8435825886";

const DRIPS_TO_USD_RATE = 0.001284;
const MIN_REDEMPTION = 5000;

export default function Home() {
  const {
    points,
    addPoints,
    dailyEarnings,
    hasCompletedOnboarding,
    hasAcceptedTerms,
    completeOnboarding,
    acceptTerms,
    userLevel,
    username,
    setUsername,
    theme,
    recordShare,
    getDailyShareCount,
    checkDailyReset,
    walletAddress,
    setWalletAddress,
    createRedemption,
    updateRedemptionStatus,
    badges,
    addBadge,
    claimBadgeReward,
  } = useStore();

  const themeConfig = THEME_CONFIGS[theme];
  const isDark = themeConfig.isDark;

  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(Platform.OS !== 'web');
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showBitLabsModal, setShowBitLabsModal] = useState(false);
  const [showAdGemModal, setShowAdGemModal] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<any>(null);
  const [unityRewardedAd, setUnityRewardedAd] = useState<any>(null);

  const DAILY_CAP = 5000;
  const AD_REVENUE_CENTS = 5;

  useEffect(() => {
    const setupAds = async () => {
      if (Platform.OS === 'web') return;
      
      try {
        const { status } = await requestTrackingPermissionsAsync();
        if (status === 'granted') {
          console.log('Tracking permission granted');
        }

        const result = await initializeAds();
        if (result && result.success) {
          const { RewardedAdEventType, AdEventType } = getAdEventTypes();
          
          // AdMob standard ad
          const adMobId = __DEV__ ? "ca-app-pub-3940256099942544/1712485313" : "ca-app-pub-4501953262639636/8435825886";
          const ad = createRewardedAd(adMobId);
          setRewardedAd(ad);
          
          if (ad && ad.load) {
            ad.load();
            ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
              console.error("AdMob error:", error);
            });
            ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
              const drips = Math.random() < 0.6 ? 100 : 200;
              handleVideoComplete(drips, true);
            });
          }

          // Unity Ads via AdMob Mediation
          const unityMediationId = __DEV__ ? "ca-app-pub-3940256099942544/1712485313" : "ca-app-pub-4501953262639636/8435825886";
          const unityAd = createRewardedAd(unityMediationId);
          setUnityRewardedAd(unityAd);
          if (unityAd && unityAd.load) {
            unityAd.load();
            unityAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
              console.error("Unity Ad Error:", error);
            });
            unityAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
              const drips = Math.random() < 0.6 ? 100 : 200;
              handleVideoComplete(drips, true);
            });
          }
        }
      } catch (e) {
        console.log("Ads initialization skipped or failed:", e);
      }
    };
    
    setupAds();
  }, []);

  useEffect(() => {
    checkDailyReset();
  }, []);

  useEffect(() => {
    if (!showSplash && hasCompletedOnboarding && !hasAcceptedTerms) {
      setShowAcknowledgment(true);
    } else if (
      !showSplash &&
      hasCompletedOnboarding &&
      hasAcceptedTerms &&
      !username
    ) {
      setShowUsernameSetup(true);
    }
  }, [showSplash, hasCompletedOnboarding, hasAcceptedTerms, username]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowAcknowledgment(true);
  };

  const handleAcceptTerms = () => {
    acceptTerms();
    setShowAcknowledgment(false);
  };

  const handleWatchAd = () => {
    if (dailyEarnings >= DAILY_CAP) {
      Alert.alert("Daily Limit Reached", "Come back tomorrow for more drips!");
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert("Development", "Ads are not available on web preview. Points will be added for testing.");
      addPoints(100);
      return;
    }

    // Only use AdMob specific ID for standard ad
    const adMobId = __DEV__ ? "ca-app-pub-3940256099942544/1712485313" : "ca-app-pub-4501953262639636/8435825886";
    
    if (rewardedAd && rewardedAd.loaded) {
      rewardedAd.show();
    } else if (rewardedAd && rewardedAd.load) {
      setLoading(true);
      rewardedAd.load();
      setTimeout(() => {
        setLoading(false);
        if (rewardedAd.loaded) {
          rewardedAd.show();
        } else {
          setShowVideoPlayer(true);
        }
      }, 2000);
    } else {
      setShowVideoPlayer(true);
    }
  };

  const handleWatchUnityAd = () => {
    if (dailyEarnings >= DAILY_CAP) {
      Alert.alert("Daily Limit Reached", "Come back tomorrow for more drips!");
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert("Development", "Unity Ads are not available on web preview. Points will be added for testing.");
      addPoints(100);
      return;
    }

    // Unity Ads uses its specific mediated ID
    const unityMediationId = __DEV__ ? "ca-app-pub-3940256099942544/1712485313" : "ca-app-pub-4501953262639636/8435825886";

    if (unityRewardedAd && unityRewardedAd.loaded) {
      unityRewardedAd.show();
    } else if (unityRewardedAd && unityRewardedAd.load) {
      setLoading(true);
      unityRewardedAd.load();
      setTimeout(() => {
        setLoading(false);
        if (unityRewardedAd.loaded) {
          unityRewardedAd.show();
        } else {
          // If in Expo Go, provide a helpful message
          if (Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient') {
            Alert.alert(
              "Native Ads Limited",
              "Native Ad SDKs (Unity/AdMob) are disabled in Expo Go. You'll need a Development Build to use these live features.",
              [{ text: "Test Reward (+100)", onPress: () => addPoints(100) }, { text: "OK" }]
            );
          } else {
            Alert.alert("Ad not ready", "Unity Ad is still loading, please try again in a moment.");
          }
        }
      }, 2000);
    } else {
      if (Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient') {
        Alert.alert(
          "Native Ads Limited",
          "Native Ad SDKs (Unity/AdMob) are disabled in Expo Go. You'll need a Development Build to use these live features.",
          [{ text: "Test Reward (+100)", onPress: () => addPoints(100) }, { text: "OK" }]
        );
      } else {
        Alert.alert("Ad Error", "Unity Ads initialization failed.");
      }
    }
  };

  const handleVideoComplete = (drips: number, fromAdMob: boolean = false) => {
    addPoints(drips);
    if (!fromAdMob) {
      setShowVideoPlayer(false);
    }
    
    // Get the latest badges state directly from store to avoid stale closure issues
    const currentBadges = useStore.getState().badges;
    
    // Check if this is the first video watched - unlock First Steps badge
    if (!currentBadges.includes('first_video')) {
      addBadge('first_video');
      const badgeReward = claimBadgeReward('first_video');
      Alert.alert(
        "Badge Unlocked!",
        `You earned ${drips} drips + ${badgeReward} bonus drips for completing your first video!`,
        [{ text: "Awesome!" }]
      );
    } else {
      Alert.alert("Success!", `You earned ${drips} drips!`);
    }
  };

  const handleShare = async (platform: string) => {
    const result = recordShare(platform);
    if (!result.success) {
      Alert.alert("Limit Reached", result.message);
      return;
    }

    const shareMessage =
      "Check out Drip'n! I'm earning crypto rewards by completing simple tasks. Join me and start earning today! #Dripn #CryptoRewards #XRP";
    const shareUrl = "https://dripn.io";

    try {
      if (platform === "x") {
        await Linking.openURL(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
        );
      } else if (platform === "facebook") {
        await Linking.openURL(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        );
      } else if (platform === "instagram") {
        Alert.alert(
          "Instagram Share",
          "Copy this message to your story: " + shareMessage,
        );
      }

      Alert.alert("Shared!", result.message);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRedeemDrips = () => {
    if (points < MIN_REDEMPTION) {
      Alert.alert(
        "Insufficient Drips",
        `You need at least ${MIN_REDEMPTION.toLocaleString()} drips to redeem.`,
      );
      return;
    }
    setShowRedeemModal(true);
  };

  const handleConnectWallet = () => {
    Alert.alert(
      "Connect Wallet",
      "To receive redemptions, you'll enter your XRP wallet address during the redemption process.",
      [{ text: "OK" }]
    );
  };

  const handleRedemptionSubmit = async (dripsAmount: number, xrpPrice: number) => {
    try {
      const usdAmount = dripsAmount * DRIPS_TO_USD_RATE;
      const xrpAmount = usdAmount / xrpPrice;

      const redemption = createRedemption(
        dripsAmount,
        usdAmount,
        xrpAmount,
        xrpPrice,
        walletAddress || ""
      );

      setTimeout(() => {
        const mockTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        updateRedemptionStatus(redemption.id, "completed", mockTransactionId);
      }, 2000);

      return {
        success: true,
        xrpAmount,
        transactionId: `PENDING-${redemption.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to process redemption. Please try again.",
      };
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AcknowledgmentPopup
        visible={showAcknowledgment}
        onAccept={handleAcceptTerms}
      />
      <VideoPlayer
        visible={showVideoPlayer}
        onCancel={() => setShowVideoPlayer(false)}
        onComplete={handleVideoComplete}
        adRevenue={AD_REVENUE_CENTS}
      />
      <UsernameSetup
        visible={showUsernameSetup}
        currentUsername={username}
        onSave={(name) => setUsername(name)}
        onClose={() => {
          if (username) setShowUsernameSetup(false);
        }}
      />
      <RedeemDripsModal
        visible={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        availableBalance={points}
        walletAddress={walletAddress}
        onSubmit={handleRedemptionSubmit}
        onSetWalletAddress={setWalletAddress}
      />

      <AppHeader showLogo />

      {username && (
        <View style={[styles.welcomeBar, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.welcomeText, { color: themeConfig.primary }]}>
            Welcome, {username}
          </Text>
        </View>
      )}

      <ScrollView
        style={[styles.content, { backgroundColor: themeConfig.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[themeConfig.primary, themeConfig.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <View style={styles.balanceLabelRow}>
              <View style={styles.waterIconBg}>
                <MaterialCommunityIcons name="water" size={20} color="#fff" />
              </View>
              <Text style={styles.balanceLabelText}>YOUR BALANCE</Text>
            </View>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="shield-star" size={14} color="#ffd43b" />
              <Text style={styles.levelText}>{userLevel}</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{points.toLocaleString()}</Text>
          <Text style={styles.balanceSubtext}>drips</Text>
          <View style={styles.dailyProgressContainer}>
            <View style={styles.dailyProgressHeader}>
              <Text style={styles.dailyProgressLabel}>Daily Progress</Text>
              <Text style={styles.dailyProgressValue}>{dailyEarnings}/{DAILY_CAP}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillGradient, { width: `${Math.min((dailyEarnings / DAILY_CAP) * 100, 100)}%` }]} />
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity
          style={styles.redeemButton}
          onPress={handleRedeemDrips}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.redeemButtonGradient}
          >
            <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#fff" />
            <Text style={styles.redeemButtonText}>Redeem Drips</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Quick Tasks</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>EARN</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: themeConfig.card }]}
          onPress={handleWatchAd}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            style={styles.taskIconGradient}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: themeConfig.text }]}>Watch Video Ad</Text>
            <Text style={[styles.taskSubtitle, { color: themeConfig.textMuted }]}>Earn 1-5 drips per video</Text>
          </View>
          <View style={styles.taskArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={themeConfig.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: themeConfig.card }]}
          onPress={handleWatchUnityAd}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            style={styles.taskIconGradient}
          >
            <MaterialCommunityIcons name="unity" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: themeConfig.text }]}>Unity Ads</Text>
            <Text style={[styles.taskSubtitle, { color: themeConfig.textMuted }]}>Earn 100-200 drips via Unity</Text>
          </View>
          <View style={styles.taskArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={themeConfig.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Offerwalls</Text>
          <View style={[styles.sectionBadge, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.sectionBadgeText, { color: "#d97706" }]}>HOT</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: themeConfig.card }]}
          onPress={() => {
            if (Platform.OS === 'web') {
              Alert.alert("Development", "AdMob is not available on web preview. Points will be added for testing.");
              addPoints(100);
            } else {
              handleWatchAd();
            }
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            style={styles.taskIconGradient}
          >
            <MaterialCommunityIcons name="star-four-points" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: themeConfig.text }]}>AdMob Offers</Text>
            <Text style={[styles.taskSubtitle, { color: themeConfig.textMuted }]}>Premium video and interactive offers</Text>
          </View>
          <View style={styles.taskArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={themeConfig.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: themeConfig.card }]}
          onPress={() => setShowBitLabsModal(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            style={styles.taskIconGradient}
          >
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: themeConfig.text }]}>BitLabs Surveys</Text>
            <Text style={[styles.taskSubtitle, { color: themeConfig.textMuted }]}>Share your opinion for drips</Text>
          </View>
          <View style={styles.taskArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={themeConfig.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskCard, { backgroundColor: themeConfig.card }]}
          onPress={() => setShowAdGemModal(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[themeConfig.primary, themeConfig.secondary]}
            style={styles.taskIconGradient}
          >
            <MaterialCommunityIcons name="gift-outline" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: themeConfig.text }]}>AdGem Offers</Text>
            <Text style={[styles.taskSubtitle, { color: themeConfig.textMuted }]}>High-paying apps and games</Text>
          </View>
          <View style={styles.taskArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={themeConfig.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Social Sharing</Text>
          <View style={[styles.sectionBadge, { backgroundColor: "#dbeafe" }]}>
            <Text style={[styles.sectionBadgeText, { color: "#2563eb" }]}>100 DRIPS</Text>
          </View>
        </View>
        <Text style={[styles.shareInfoText, isDark && styles.textMuted]}>
          1 share per platform daily
        </Text>
        <View style={styles.shareRow}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare("x")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#1f2937", "#111827"]}
              style={styles.shareButtonGradient}
            >
              <MaterialCommunityIcons name="twitter" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare("facebook")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#1877f2", "#1565d8"]}
              style={styles.shareButtonGradient}
            >
              <MaterialCommunityIcons name="facebook" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare("instagram")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#e4405f", "#c13584"]}
              style={styles.shareButtonGradient}
            >
              <MaterialCommunityIcons name="instagram" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeConfig.card }]}>
          <View style={styles.infoIconContainer}>
            <MaterialCommunityIcons name="shield-check" size={20} color={themeConfig.primary} />
          </View>
          <Text style={[styles.infoCardText, { color: themeConfig.textMuted }]}>
            Redemptions are processed securely by CoinGate. Final XRP amount depends on market rates at time of processing.
          </Text>
        </View>
      </ScrollView>

      {/* Offerwall Modals */}
      <Modal
        visible={showAdGemModal}
        animationType="slide"
        onRequestClose={() => setShowAdGemModal(false)}
      >
        <View style={styles.modalContent}>
          <WebView
            source={{
              uri: "https://api.adgem.com/v1/wall?appid=31880",
            }}
            onNavigationStateChange={(navState: any) => {
              if (navState.url.includes("success")) {
                addPoints(100);
                setShowAdGemModal(false);
              }
            }}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
          />
          <View style={styles.modalFooter}>
            <Text style={styles.modalFooterTitle}>AdGem Offerwall</Text>
            <TouchableOpacity 
              style={styles.closeFooterBtn}
              onPress={() => setShowAdGemModal(false)}
            >
              <Text style={styles.closeFooterText}>Exit Offerwall</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBitLabsModal}
        animationType="slide"
        onRequestClose={() => setShowBitLabsModal(false)}
      >
        <View style={styles.modalContent}>
          <WebView
            source={{
              uri: "https://web.bitlabs.ai/?token=YOUR_BITLABS_TOKEN",
            }}
            onNavigationStateChange={(navState: any) => {
              if (navState.url.includes("complete")) {
                addPoints(100);
                setShowBitLabsModal(false);
              }
            }}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
          />
          <View style={styles.modalFooter}>
            <Text style={styles.modalFooterTitle}>BitLabs Surveys</Text>
            <TouchableOpacity 
              style={styles.closeFooterBtn}
              onPress={() => setShowBitLabsModal(false)}
            >
              <Text style={styles.closeFooterText}>Exit Offerwall</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  containerDark: { backgroundColor: "#0f172a" },
  cardDark: { backgroundColor: "#1e293b" },
  textDark: { color: "#f1f5f9" },
  textMuted: { color: "#94a3b8" },
  welcomeBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#e8f4fd",
    marginTop: 0,
  },
  welcomeBarDark: {
    backgroundColor: "#1e3a5f",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e40af",
    textAlign: "center",
  },
  welcomeTextDark: {
    color: "#93c5fd",
  },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  waterIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  balanceLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.5,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffd43b",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: 56,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -2,
  },
  balanceSubtext: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    marginTop: -4,
    marginBottom: 20,
  },
  dailyProgressContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
  },
  dailyProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dailyProgressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  dailyProgressValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFillGradient: {
    height: "100%",
    backgroundColor: "#ffd43b",
    borderRadius: 4,
  },
  
  redeemButton: {
    marginBottom: 28,
    borderRadius: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  redeemButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 10,
    flex: 1,
  },
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  sectionBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
    letterSpacing: 0.5,
  },
  
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  taskIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 14,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 3,
  },
  taskSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  taskArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  
  shareInfoText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 14,
    fontWeight: "500",
  },
  shareRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  shareButton: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonGradient: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 16,
    alignItems: "flex-start",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCardText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 13,
    color: "#166534",
    lineHeight: 20,
    fontWeight: "500",
  },
  
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalFooterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: '#1e293b',
  },
  closeFooterBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  closeFooterText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
});
