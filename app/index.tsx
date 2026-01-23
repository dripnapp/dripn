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
} from "react-native";
import { WebView } from "react-native-webview";
import { useStore } from "../src/store/useStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SplashScreen from "../src/components/SplashScreen";
import OnboardingScreen from "../src/components/OnboardingScreen";
import AcknowledgmentPopup from "../src/components/AcknowledgmentPopup";
import VideoPlayer from "../src/components/VideoPlayer";
import UsernameSetup from "../src/components/UsernameSetup";
import AppHeader from "../src/components/AppHeader";
import RedeemDripsModal from "../src/components/RedeemDripsModal";

// Mocks for web compatibility
let mobileAds: any = () => ({ initialize: () => Promise.resolve() });
let RewardedAd: any = { createForAdRequest: () => ({ load: () => {}, addAdEventListener: () => () => {} }) };
let RewardedAdEventType: any = { EARNED_REWARD: 'earned_reward' };
let AdEventType: any = { ERROR: 'error' };

// Conditional require to prevent web bundling errors
if (Platform.OS !== 'web') {
  try {
    const ads = require("react-native-google-mobile-ads");
    mobileAds = ads.default;
    RewardedAd = ads.RewardedAd;
    RewardedAdEventType = ads.RewardedAdEventType;
    AdEventType = ads.AdEventType;
  } catch (e) {
    console.warn("Mobile ads failed to load:", e);
  }
}

const rewardedAdUnitId = __DEV__
  ? "ca-app-pub-3940256099942544/1712485313"
  : "YOUR_REAL_REWARDED_UNIT_ID_HERE";

const rewarded = RewardedAd?.createForAdRequest ? RewardedAd.createForAdRequest(rewardedAdUnitId) : RewardedAd;

const DRIPS_TO_USD_RATE = 0.001284;
const MIN_REDEMPTION = 1000;

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
  } = useStore();

  const isDark = theme === "dark" || theme === "neon";

  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showBitLabsModal, setShowBitLabsModal] = useState(false);
  const [showAdGemModal, setShowAdGemModal] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const DAILY_CAP = 500;
  const AD_REVENUE_CENTS = 5;

  useEffect(() => {
    if (Platform.OS !== 'web' && mobileAds) {
      mobileAds()
        .initialize()
        .then(() => console.log("AdMob initialized successfully"))
        .catch((error: any) => console.error("AdMob init error:", error));

      if (rewarded && rewarded.load) {
        rewarded.load();

        rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
          console.error("Ad error:", error);
        });

        const rewardListener = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            addPoints(reward.amount);
            Alert.alert("Reward Earned!", `You earned ${reward.amount} drips!`);
          },
        );

        return () => {
          if (rewardListener && typeof rewardListener === 'function') {
            rewardListener();
          }
        };
      }
    }
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
      addPoints(10);
      return;
    }

    if (rewarded && rewarded.loaded) {
      rewarded.show();
    } else if (rewarded && rewarded.load) {
      setLoading(true);
      rewarded.load();
      setTimeout(() => {
        setLoading(false);
        if (rewarded.loaded) {
          rewarded.show();
        } else {
          setShowVideoPlayer(true);
        }
      }, 2000);
    } else {
      setShowVideoPlayer(true);
    }
  };

  const handleVideoComplete = (drips: number) => {
    addPoints(drips);
    setShowVideoPlayer(false);
    Alert.alert("Success!", `You earned ${drips} drips!`);
  };

  const handleShare = async (platform: string) => {
    const dailyCount = getDailyShareCount();
    if (dailyCount >= 3) {
      Alert.alert(
        "Daily Limit",
        "You've reached the daily share limit. Come back tomorrow!",
      );
      return;
    }

    const { canShare, timeLeft } = recordShare();
    if (!canShare) {
      Alert.alert("Cooldown", `Please wait ${timeLeft}s before sharing again.`);
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
      } else {
        await Share.share({
          message: `${shareMessage} ${shareUrl}`,
        });
      }

      const rewards = [1, 1, 3];
      const reward = rewards[dailyCount] || 0;
      if (reward > 0) {
        addPoints(reward);
        Alert.alert("Shared!", `You earned ${reward} drips!`);
      }
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
        onClose={() => setShowVideoPlayer(false)}
        onComplete={handleVideoComplete}
      />
      <UsernameSetup
        visible={showUsernameSetup}
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.balanceSection, isDark && styles.cardDark]}>
          <Text style={[styles.balanceLabel, isDark && styles.textMuted]}>
            YOUR DRIPS
          </Text>
          <View style={styles.balanceRow}>
            <MaterialCommunityIcons name="water" size={32} color="#4dabf7" />
            <Text style={[styles.balanceValue, isDark && styles.textDark]}>
              {points.toLocaleString()}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={[styles.earningsText, isDark && styles.textMuted]}>
              Today: {dailyEarnings}/{DAILY_CAP}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(dailyEarnings / DAILY_CAP) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, isDark && styles.cardDark]}
            onPress={handleConnectWallet}
          >
            <MaterialCommunityIcons
              name={walletAddress ? "wallet-check" : "wallet-plus"}
              size={32}
              color="#4dabf7"
            />
            <Text style={[styles.actionText, isDark && styles.textDark]}>
              {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, isDark && styles.cardDark]}
            onPress={handleRedeemDrips}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={32}
              color="#40c057"
            />
            <Text style={[styles.actionText, isDark && styles.textDark]}>
              Redeem Drips
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Quick Tasks
        </Text>

        <TouchableOpacity
          style={[styles.taskCard, isDark && styles.cardDark]}
          onPress={handleWatchAd}
        >
          <View style={styles.taskIconCircle}>
            <MaterialCommunityIcons name="play-circle" size={28} color="#fff" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, isDark && styles.textDark]}>
              Watch Video Ad
            </Text>
            <Text style={[styles.taskSubtitle, isDark && styles.textMuted]}>
              Earn 1-5 drips per video
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Offerwalls
        </Text>

        <TouchableOpacity
          style={[styles.taskCard, isDark && styles.cardDark]}
          onPress={() => setShowAdGemModal(true)}
        >
          <View
            style={[styles.taskIconCircle, { backgroundColor: "#7c3aed" }]}
          >
            <MaterialCommunityIcons name="gift" size={24} color="#fff" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, isDark && styles.textDark]}>
              AdGem Offers
            </Text>
            <Text style={[styles.taskSubtitle, isDark && styles.textMuted]}>
              High-paying apps and games
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskCard, isDark && styles.cardDark]}
          onPress={() => setShowBitLabsModal(true)}
        >
          <View
            style={[styles.taskIconCircle, { backgroundColor: "#f59f00" }]}
          >
            <MaterialCommunityIcons name="clipboard-text" size={24} color="#fff" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, isDark && styles.textDark]}>
              BitLabs Surveys
            </Text>
            <Text style={[styles.taskSubtitle, isDark && styles.textMuted]}>
              Share your opinion for drips
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Social Sharing
        </Text>
        <View style={styles.shareRow}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#000000" }]}
            onPress={() => handleShare("x")}
          >
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#1877f2" }]}
            onPress={() => handleShare("facebook")}
          >
            <MaterialCommunityIcons name="facebook" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#e4405f" }]}
            onPress={() => handleShare("instagram")}
          >
            <MaterialCommunityIcons name="instagram" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#40c057" }]}
            onPress={() => handleShare("other")}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, isDark && styles.cardDark]}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#4dabf7" />
          <Text style={[styles.infoText, isDark && styles.textMuted]}>
            Redemptions are processed by CoinGate. Final XRP amount depends on the market rate at the time of processing.
          </Text>
        </View>
      </ScrollView>

      {/* Offerwall Modals */}
      <Modal
        visible={showAdGemModal}
        animationType="slide"
        onRequestClose={() => setShowAdGemModal(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>AdGem Offerwall</Text>
          <TouchableOpacity onPress={() => setShowAdGemModal(false)}>
            <MaterialCommunityIcons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <WebView
          source={{
            uri: "https://api.adgem.com/v1/wall?appid=YOUR_ADGEM_APP_ID",
          }}
          onNavigationStateChange={(navState: any) => {
            if (navState.url.includes("success")) {
              addPoints(50);
              setShowAdGemModal(false);
            }
          }}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </Modal>

      <Modal
        visible={showBitLabsModal}
        animationType="slide"
        onRequestClose={() => setShowBitLabsModal(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>BitLabs Surveys</Text>
          <TouchableOpacity onPress={() => setShowBitLabsModal(false)}>
            <MaterialCommunityIcons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <WebView
          source={{
            uri: "https://web.bitlabs.ai/?token=YOUR_BITLABS_TOKEN",
          }}
          onNavigationStateChange={(navState: any) => {
            if (navState.url.includes("complete")) {
              addPoints(25);
              setShowBitLabsModal(false);
            }
          }}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  containerDark: { backgroundColor: "#1a1a2e" },
  cardDark: { backgroundColor: "#252542" },
  textDark: { color: "#fff" },
  textMuted: { color: "#a0a0a0" },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  balanceSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceLabel: { fontSize: 12, fontWeight: "bold", color: "#868e96", letterSpacing: 1 },
  balanceRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  balanceValue: { fontSize: 42, fontWeight: "bold", color: "#1a1a1a", marginLeft: 10 },
  earningsRow: { width: "100%", marginTop: 20 },
  earningsText: { fontSize: 13, color: "#868e96", marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: "#f1f3f5", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4dabf7" },
  actionRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#495057", marginTop: 10, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a", marginBottom: 15 },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
  },
  taskInfo: { flex: 1, marginLeft: 16 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  taskSubtitle: { fontSize: 13, color: "#868e96", marginTop: 2 },
  shareRow: { flexDirection: "row", gap: 12, marginBottom: 25 },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 12, color: "#495057", lineHeight: 18 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
});
