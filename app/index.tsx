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
import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from "react-native-google-mobile-ads";

// AdMob rewarded setup
const rewardedAdUnitId = __DEV__
  ? "ca-app-pub-3940256099942544/1712485313" // Google test rewarded video
  : "YOUR_REAL_REWARDED_UNIT_ID_HERE";

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId);

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
  } = useStore();

  const isDark = theme === "dark" || theme === "neon";

  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showBitLabsModal, setShowBitLabsModal] = useState(false);
  const [showAdGemModal, setShowAdGemModal] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  const DAILY_CAP = 500;
  const AD_REVENUE_CENTS = 5;

  // AdMob Rewarded Setup
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log("AdMob initialized successfully"))
      .catch((error: any) => console.error("AdMob init error:", error));

    rewarded.load();

    rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error("Ad error:", error);
    });

    const rewardListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        addPoints(reward.amount);
        Alert.alert("Reward Earned!", `You earned ${reward.amount} drips!`);
      },
    );

    return () => rewardListener();
  }, []);

  useEffect(() => {
    checkDailyReset();
  }, []);

  useEffect(() => {
    if (!showSplash && hasCompletedOnboarding && !hasAcceptedTerms) {
      setShowAcknowledgment(true);
    } else if (!showSplash && hasCompletedOnboarding && hasAcceptedTerms && !username) {
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
    if (!username) {
      setShowUsernameSetup(true);
    }
  };

  const handleWatchAd = () => {
    if (!username) {
      setShowUsernameSetup(true);
      return;
    }
    if (dailyEarnings >= DAILY_CAP) {
      Alert.alert(
        "Limit Reached",
        "You have reached your daily earning limit. Come back tomorrow!",
      );
      return;
    }
    setShowVideoPlayer(true);
  };

  const handleVideoComplete = (reward: number) => {
    addPoints(reward);
    setShowVideoPlayer(false);
    Alert.alert("Reward Earned!", `You earned ${reward} drips!`);
  };

  const handleVideoCancel = () => {
    setShowVideoPlayer(false);
    Alert.alert("Cancelled", "You must watch the full video to earn drips.");
  };

  const handleAdGemOfferwall = () => {
    if (!username) {
      setShowUsernameSetup(true);
      return;
    }
    setShowAdGemModal(true);
  };

  const handleShare = async (
    platform: "twitter" | "facebook" | "text" | "instagram",
  ) => {
    if (!username) {
      setShowUsernameSetup(true);
      return;
    }
    const shareCount = getDailyShareCount();
    if (shareCount >= 3) {
      Alert.alert(
        "Limit Reached",
        "You have reached the maximum 3 shares for today.",
      );
      return;
    }

    const shareMessage =
      "Check out Drip'n - earn crypto rewards by watching videos! every drip counts. Download now!";
    const shareUrl = "https://dripnapp.com";

    try {
      let shared = false;

      if (platform === "twitter") {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
        const canOpen = await Linking.canOpenURL(twitterUrl);
        if (canOpen) {
          await Linking.openURL(twitterUrl);
          shared = true;
        }
      } else if (platform === "facebook") {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
        const canOpen = await Linking.canOpenURL(facebookUrl);
        if (canOpen) {
          await Linking.openURL(facebookUrl);
          shared = true;
        }
      } else if (platform === "instagram") {
        const instagramUrl = "instagram://app";
        const canOpen = await Linking.canOpenURL(instagramUrl);
        if (canOpen) {
          await Linking.openURL(instagramUrl);
          shared = true;
        } else {
          await Linking.openURL("https://instagram.com");
          shared = true;
        }
      } else if (platform === "text") {
        const result = await Share.share({
          message: `${shareMessage} ${shareUrl}`,
        });
        if (result.action === Share.sharedAction) {
          shared = true;
        }
      }

      if (shared) {
        const shareResult = recordShare(platform);
        if (shareResult.success) {
          Alert.alert("Reward Earned!", shareResult.message);
        } else {
          Alert.alert("Notice", shareResult.message);
        }
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const getNextShareReward = () => {
    const count = getDailyShareCount();
    if (count >= 3) return 0;
    if (count === 0) return 1;
    if (count === 1) return 1;
    return 3;
  };

  const handleRedeemDrips = () => {
    Alert.alert("Redeem Drips", "Cash out process coming soon!");
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <View style={[styles.wrapper, isDark && styles.wrapperDark]}>
      <AcknowledgmentPopup
        visible={showAcknowledgment}
        onAccept={handleAcceptTerms}
      />
      <VideoPlayer
        visible={showVideoPlayer}
        onComplete={handleVideoComplete}
        onCancel={handleVideoCancel}
        adRevenue={AD_REVENUE_CENTS / 100}
      />
      <UsernameSetup
        visible={showUsernameSetup}
        currentUsername={username}
        onSave={setUsername}
        onClose={() => {
          if (username) setShowUsernameSetup(false);
          // Only show warning if user tries to close without a username
        }}
      />

      <AppHeader showLogo />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.profileRow}>
          <View style={[styles.levelBadge, isDark && styles.levelBadgeDark]}>
            <MaterialCommunityIcons
              name={
                userLevel === "Gold"
                  ? "trophy"
                  : userLevel === "Silver"
                    ? "medal-outline"
                    : "medal"
              }
              size={16}
              color={
                userLevel === "Gold"
                  ? "#f59f00"
                  : userLevel === "Silver"
                    ? "#868e96"
                    : "#cd7f32"
              }
            />
            <Text style={[styles.levelText, isDark && styles.textDark]}>
              {userLevel} Member
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, isDark && styles.profileButtonDark]}
            onPress={() => setShowUsernameSetup(true)}
          >
            <MaterialCommunityIcons
              name="account-edit"
              size={16}
              color="#4dabf7"
            />
            <Text style={styles.profileButtonText}>
              {username || "Set Username"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            Your Balance
          </Text>
          <Text style={styles.balance}>{points} drips</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min((points / 500) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.min(points, 500)} / 500 drips to next level
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.redeemButton} 
          onPress={handleRedeemDrips}
        >
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#fff" />
          <Text style={styles.redeemButtonText}>Redeem Drips</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Quick Tasks
          </Text>

          <TouchableOpacity
            style={styles.taskButton}
            onPress={handleWatchAd}
            disabled={loading}
          >
            <MaterialCommunityIcons name="water" size={32} color="#fff" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Watch Rewarded Video</Text>
              <Text style={styles.taskReward}>+1-4 drips (varies by ad)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskButton}
            onPress={() => {
              if (!username) {
                setShowUsernameSetup(true);
                return;
              }
              if (rewarded.loaded) {
                rewarded
                  .show()
                  .catch((error) => console.error("Ad show error:", error));
              } else {
                Alert.alert(
                  "Not ready",
                  "Ad is still loading, try again in a moment.",
                );
                rewarded.load();
              }
            }}
          >
            <MaterialCommunityIcons name="video" size={32} color="#fff" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Watch AdMob Offers</Text>
              <Text style={styles.taskReward}>Earn drips (test mode)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskButton}
            onPress={handleAdGemOfferwall}
          >
            <MaterialCommunityIcons name="offer" size={32} color="#fff" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>AdGem Offers</Text>
              <Text style={styles.taskReward}>
                Earn more drips (surveys, apps)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskButton}
            onPress={() => {
              if (!username) {
                setShowUsernameSetup(true);
                return;
              }
              setShowBitLabsModal(true);
            }}
          >
            <MaterialCommunityIcons name="poll" size={32} color="#fff" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>BitLabs Offers</Text>
              <Text style={styles.taskReward}>
                Earn drips (surveys & tasks)
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.shareTaskCard, isDark && styles.cardDark]}>
            <View style={styles.shareHeader}>
              <MaterialCommunityIcons
                name="share-variant"
                size={24}
                color="#4dabf7"
              />
              <View style={styles.shareHeaderText}>
                <Text style={[styles.shareTitle, isDark && styles.textDark]}>
                  Share Drip'n
                </Text>
                <Text
                  style={[styles.shareSubtitle, isDark && styles.labelDark]}
                >
                  {getDailyShareCount()}/3 shares today • +
                  {getNextShareReward()} drips next
                </Text>
              </View>
            </View>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[styles.shareButton, styles.xButton]}
                onPress={() => handleShare("twitter")}
                disabled={getDailyShareCount() >= 3}
              >
                <Text style={styles.xButtonText}>𝕏</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, styles.facebookButton]}
                onPress={() => handleShare("facebook")}
                disabled={getDailyShareCount() >= 3}
              >
                <MaterialCommunityIcons
                  name="facebook"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, styles.instagramButton]}
                onPress={() => handleShare("instagram")}
                disabled={getDailyShareCount() >= 3}
              >
                <MaterialCommunityIcons
                  name="instagram"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, styles.textButton]}
                onPress={() => handleShare("text")}
                disabled={getDailyShareCount() >= 3}
              >
                <MaterialCommunityIcons
                  name="message-text"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AdGem Offerwall Modal */}
        <Modal
          visible={showAdGemModal}
          animationType="slide"
          onRequestClose={() => setShowAdGemModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <WebView
              source={{
                uri: `https://offerwall.adgem.com/?app_id=31857&user_id=${username || "guest_" + Date.now()}`,
              }}
              style={{ flex: 1 }}
              onNavigationStateChange={(navState) => {
                if (
                  navState.url.includes("reward") ||
                  navState.url.includes("complete")
                ) {
                  Alert.alert(
                    "Reward Detected",
                    "Check your AdGem dashboard or balance",
                  );
                }
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn("WebView error: ", nativeEvent);
              }}
            />
            <TouchableOpacity
              style={{
                padding: 20,
                backgroundColor: "#4dabf7",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setShowAdGemModal(false)}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                Close Offerwall
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* BitLabs Offer Wall Modal */}
        <Modal
          visible={showBitLabsModal}
          animationType="slide"
          onRequestClose={() => setShowBitLabsModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <WebView
              source={{
                uri: `https://web.bitlabs.ai?token=f7a85bbf-4336-46fa-87ff-1940b5ccedcc&uid=${username || "guest_" + Date.now()}`,
              }}
              style={{ flex: 1 }}
              onNavigationStateChange={(navState) => {
                if (
                  navState.url.includes("reward") ||
                  navState.url.includes("complete")
                ) {
                  Alert.alert(
                    "Reward Detected",
                    "Check your BitLabs dashboard or balance",
                  );
                }
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn("WebView error: ", nativeEvent);
              }}
            />
            <TouchableOpacity
              style={{
                padding: 20,
                backgroundColor: "#4dabf7",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setShowBitLabsModal(false)}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                Close Offerwall
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Daily Earnings: {dailyEarnings} / 500 drips
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f8f9fa" },
  wrapperDark: { backgroundColor: "#1a1a2e" },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadgeDark: { backgroundColor: "#252542" },
  levelText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
  },
  textDark: { color: "#fff" },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f5ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileButtonDark: { backgroundColor: "#252542" },
  profileButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#4dabf7",
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  cardDark: { backgroundColor: "#252542" },
  labelDark: { color: "#a0a0a0" },
  label: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balance: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#4dabf7",
    marginVertical: 5,
  },
  redeemButton: {
    backgroundColor: "#40c057",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  redeemButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1a1a1a",
  },
  taskButton: {
    backgroundColor: "#4dabf7",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  taskInfo: { marginLeft: 15 },
  taskName: { color: "#fff", fontSize: 18, fontWeight: "600" },
  taskReward: { color: "#e7f5ff", fontSize: 14 },
  shareTaskCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  shareHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  shareHeaderText: { marginLeft: 12, flex: 1 },
  shareTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  shareSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  shareButtons: { flexDirection: "row", justifyContent: "space-between" },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },
  xButton: { backgroundColor: "#000000" },
  xButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  facebookButton: { backgroundColor: "#4267B2" },
  instagramButton: { backgroundColor: "#E4405F" },
  textButton: { backgroundColor: "#2f9e44" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  infoCard: {
    padding: 15,
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    marginTop: 20,
  },
  infoCardDark: { backgroundColor: "#252542" },
  infoText: {
    fontSize: 12,
    color: "#495057",
    textAlign: "center",
    marginVertical: 2,
  },
  infoTextDark: { color: "#a0a0a0" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    marginTop: 15,
    marginBottom: 5,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4dabf7",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: "#868e96", textAlign: "right" },
});
