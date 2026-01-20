import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from "react-native";
import { useStore } from "../src/store/useStore";
import { getXRPPrice } from "../src/services/xrpService";
import {
  createSignInRequest,
  pollForSignIn,
} from "../src/services/xummService";
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
import UnityAds from "expo-unity-ads";

// Test rewarded ad unit ID (fake video always plays during development)
const rewardedAdUnitId = __DEV__
  ? "ca-app-pub-3940256099942544/1712485313" // Google test rewarded video
  : "YOUR_REAL_REWARDED_UNIT_ID_HERE"; // Replace with real one later

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId);

const formatCurrency = (value: number, locale?: string): string => {
  const userLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  try {
    return new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  } catch {
    return `$${value.toFixed(4)}`;
  }
};

export default function Home() {
  const {
    points,
    walletAddress,
    isWalletConnected,
    setWallet,
    addPoints,
    dailyEarnings,
    hasCompletedOnboarding,
    hasAcceptedTerms,
    completeOnboarding,
    acceptTerms,
    userLevel,
    disconnectWallet,
    username,
    setUsername,
    theme,
    recordShare,
    getDailyShareCount,
  } = useStore();

  const isDark = theme === "dark";

  const [xrpPrice, setXrpPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const pollingRef = useRef(false);

  const DAILY_CAP = 500;
  const AD_REVENUE_CENTS = 5;

  // AdMob Rewarded Ad Setup
  useEffect(() => {
    // Initialize AdMob SDK
    mobileAds()
      .initialize()
      .then(() => {
        console.log("AdMob initialized successfully");
      })
      .catch((error: any) => {
        console.error("AdMob init error:", error);
      });

    // Pre-load the rewarded ad
    rewarded.load();

    // Listen for general ad errors
    rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error("Ad error:", error);
    });

    // Listen for reward earned
    const rewardListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("Reward earned!", reward.amount);
        addPoints(reward.amount);
        Alert.alert("Reward Earned!", `You earned ${reward.amount} drips!`);
      },
    );

    // Cleanup listener on unmount
    return () => {
      rewardListener(); // This removes the listener
    };
  }, []);

  // Unity Ads Setup
  const [unityInitialized, setUnityInitialized] = useState(false);

  useEffect(() => {
    UnityAds.initialize("6027059", true) // true = test mode (fake ads)
      .then(() => {
        console.log("Unity Ads initialized successfully");
        setUnityInitialized(true);
      })
      .catch((error: any) => {
        console.error("Unity Ads init error:", error);
      });
  }, []);

  const showUnityRewarded = async () => {
    if (!unityInitialized) {
      Alert.alert("Not ready", "Unity Ads still initializing, try again soon.");
      return;
    }

    try {
      // Load and show rewarded video (default placement for test mode)
      await UnityAds.load("Rewarded_Android"); // Use "Rewarded_iOS" if you have a custom placement
      await UnityAds.show("Rewarded_Android");

      // Reward is handled by the global listener below
    } catch (error: any) {
      console.error("Unity show error:", error);
      Alert.alert("Error", "Failed to show Unity ad");
    }
  };

  // Listen for Unity reward event
  useEffect(() => {
    UnityAds.setRewardListener(
      (placementId: string, reward: { amount: number }) => {
        console.log(
          "Unity reward earned on placement:",
          placementId,
          "amount:",
          reward.amount,
        );
        addPoints(reward.amount);
        Alert.alert(
          "Unity Reward Earned!",
          `You earned ${reward.amount} drips!`,
        );
      },
    );
  }, [addPoints]); // Add addPoints as dependency to satisfy TS

  useEffect(() => {
    fetchPrice();
  }, []);

  useEffect(() => {
    if (!showSplash && !hasCompletedOnboarding) {
    }
    if (!showSplash && hasCompletedOnboarding && !hasAcceptedTerms) {
      setShowAcknowledgment(true);
    }
  }, [showSplash, hasCompletedOnboarding, hasAcceptedTerms]);

  const fetchPrice = async () => {
    const price = await getXRPPrice();
    setXrpPrice(price);
  };

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

  const handleConnectWallet = async () => {
    if (pollingRef.current) return;

    setLoading(true);
    setConnectionStatus("Initializing connection...");

    try {
      const result = await createSignInRequest();

      if (!result.success) {
        Alert.alert(
          "Connection Error",
          result.error || "Failed to create sign-in request",
        );
        setLoading(false);
        setConnectionStatus("");
        return;
      }

      if (result.payloadId) {
        setConnectionStatus(
          "Open Xaman app and approve the sign-in request...",
        );

        pollingRef.current = true;

        const pollResult = await pollForSignIn(
          result.payloadId,
          (status) => setConnectionStatus(status),
          60,
        );

        pollingRef.current = false;

        if (pollResult.success && pollResult.address) {
          setWallet(pollResult.address);
          Alert.alert("Success", "Wallet connected successfully!");

          if (!username) {
            setTimeout(() => setShowUsernameSetup(true), 500);
          }
        } else {
          Alert.alert(
            "Connection Failed",
            pollResult.error || "Could not connect wallet",
          );
        }
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      Alert.alert("Error", error.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
      setConnectionStatus("");
      pollingRef.current = false;
    }
  };

  const handleWatchAd = () => {
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

  const handleCashout = () => {
    if (!isWalletConnected) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }
    if (points < 500) {
      Alert.alert("Low Balance", "Minimum cashout is 500 drips");
      return;
    }

    Alert.alert(
      "Confirm Cashout",
      `Cash out 500 drips for approx ${(5 / (xrpPrice || 1)).toFixed(2)} XRP?\n\nI understand price volatility and acknowledge payouts are at current market rate.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            Alert.alert("Success", "Payout request sent! (Testnet)"),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Disconnect Wallet",
      "Are you sure you want to disconnect your wallet? You can reconnect anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            disconnectWallet();
            Alert.alert("Disconnected", "Your wallet has been disconnected.");
          },
        },
      ],
    );
  };

  const handleShare = async (
    platform: "twitter" | "facebook" | "text" | "instagram",
  ) => {
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
        onClose={() => setShowUsernameSetup(false)}
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
          {isWalletConnected && (
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
                {username ||
                  (walletAddress
                    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                    : "Set Username")}
              </Text>
            </TouchableOpacity>
          )}
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
            {Math.min(points, 500)} / 500 drips to cashout
          </Text>
        </View>

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

          {/* NEW: AdMob Rewarded Ad button */}
          <TouchableOpacity
            style={styles.taskButton}
            onPress={() => {
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
              <Text style={styles.taskName}>Watch AdMob Rewarded Ad</Text>
              <Text style={styles.taskReward}>Earn drips (test mode)</Text>
            </View>
          </TouchableOpacity>

          {/* NEW: Unity Rewarded Ad button */}
          <TouchableOpacity
            style={styles.taskButton}
            onPress={showUnityRewarded}
            disabled={!unityInitialized}
          >
            <MaterialCommunityIcons name="video" size={32} color="#fff" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Watch Unity Video</Text>
              <Text style={styles.taskReward}>Earn drips (test mode)</Text>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Wallet Status
          </Text>
          <View style={[styles.walletCard, isDark && styles.walletCardDark]}>
            {isWalletConnected ? (
              <>
                <Text style={[styles.addressLabel, isDark && styles.labelDark]}>
                  Connected Address (Testnet):
                </Text>
                <Text style={[styles.address, isDark && styles.textDark]}>
                  {walletAddress}
                </Text>
                <TouchableOpacity
                  style={styles.cashoutButton}
                  onPress={handleCashout}
                >
                  <Text style={styles.buttonText}>Cash Out to XRP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={18}
                    color="#868e96"
                  />
                  <Text style={styles.logoutText}>Disconnect Wallet</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={handleConnectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                        Connecting...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Connect with Xaman</Text>
                  )}
                </TouchableOpacity>
                {connectionStatus ? (
                  <Text style={styles.connectionStatus}>
                    {connectionStatus}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Current XRP Price:{" "}
            {xrpPrice ? formatCurrency(xrpPrice) : "Loading..."}
          </Text>
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
    marginBottom: 15,
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
  shareHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
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
  walletCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  walletCardDark: { backgroundColor: "#252542", borderColor: "#3a3a5a" },
  addressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  address: { fontSize: 12, color: "#333", fontWeight: "500", marginBottom: 15 },
  connectButton: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cashoutButton: {
    backgroundColor: "#2f9e44",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
  },
  logoutText: { color: "#868e96", fontSize: 14, marginLeft: 6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  connectionStatus: {
    fontSize: 12,
    color: "#4dabf7",
    textAlign: "center",
    marginTop: 10,
  },
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
