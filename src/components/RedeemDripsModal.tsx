import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RedeemDripsModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  walletAddress: string | null;
  onSubmit: (dripsAmount: number, xrpPrice: number) => Promise<{
    success: boolean;
    xrpAmount?: number;
    transactionId?: string;
    error?: string;
  }>;
  onSetWalletAddress: (address: string) => void;
}

type Step = "input" | "wallet" | "warning" | "terms" | "confirm" | "processing" | "success" | "error";

const DRIPS_TO_USD_RATE = 0.001284;
const MIN_REDEMPTION = 1000;

export default function RedeemDripsModal({
  visible,
  onClose,
  availableBalance,
  walletAddress,
  onSubmit,
  onSetWalletAddress,
}: RedeemDripsModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [dripsAmount, setDripsAmount] = useState("");
  const [tempWalletAddress, setTempWalletAddress] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [xrpAmount, setXrpAmount] = useState<number | null>(null);
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [xrpPrice, setXrpPrice] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bannerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  useEffect(() => {
    if (step === "success") {
      Animated.sequence([
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.spring(bannerAnim, {
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.spring(bannerAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  const resetState = () => {
    setStep("input");
    setDripsAmount("");
    setTempWalletAddress("");
    setAcceptedTerms(false);
    setXrpAmount(null);
    setUsdAmount(null);
    setXrpPrice(null);
    setTransactionId(null);
    setError(null);
    setLoading(false);
    bannerAnim.setValue(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const fetchXrpPrice = async (): Promise<number> => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd"
      );
      const data = await response.json();
      if (data.ripple?.usd) {
        return data.ripple.usd;
      }
      throw new Error("Invalid response");
    } catch (err) {
      const fallbackResponse = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=XRPUSDT"
      );
      const fallbackData = await fallbackResponse.json();
      return parseFloat(fallbackData.price);
    }
  };

  const calculateConversion = async () => {
    const amount = parseInt(dripsAmount);
    if (isNaN(amount) || amount < MIN_REDEMPTION || amount > availableBalance) {
      return null;
    }

    setLoading(true);
    try {
      const price = await fetchXrpPrice();
      const usd = amount * DRIPS_TO_USD_RATE;
      const xrp = usd / price;
      
      setXrpPrice(price);
      setUsdAmount(usd);
      setXrpAmount(xrp);
      setLoading(false);
      return { usd, xrp, price };
    } catch (err) {
      setLoading(false);
      setError("Unable to fetch current XRP price. Please try again.");
      return null;
    }
  };

  const handleProceedFromInput = async () => {
    if (!walletAddress) {
      setStep("wallet");
      return;
    }
    
    const result = await calculateConversion();
    if (result) {
      setStep("warning");
    }
  };

  const handleSaveWallet = async () => {
    if (tempWalletAddress.length < 25) {
      setError("Please enter a valid XRP wallet address");
      return;
    }
    onSetWalletAddress(tempWalletAddress);
    setError(null);
    
    const result = await calculateConversion();
    if (result) {
      setStep("warning");
    }
  };

  const handleProceedToTerms = () => {
    setStep("terms");
  };

  const handleAcceptTerms = () => {
    if (acceptedTerms) {
      setStep("confirm");
    }
  };

  const handleFinalSubmit = async () => {
    if (!xrpPrice) {
      setError("Price data not available. Please try again.");
      setStep("error");
      return;
    }
    
    setStep("processing");
    try {
      const result = await onSubmit(parseInt(dripsAmount), xrpPrice);
      if (result.success && result.xrpAmount) {
        setXrpAmount(result.xrpAmount);
        setTransactionId(result.transactionId || null);
        setStep("success");
      } else {
        setError(result.error || "Redemption failed. Please try again.");
        setStep("error");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setStep("error");
    }
  };

  const parsedAmount = parseInt(dripsAmount) || 0;
  const isValidAmount = parsedAmount >= MIN_REDEMPTION && parsedAmount <= availableBalance;
  const effectiveWallet = walletAddress || tempWalletAddress;

  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Redeem Your Drips</Text>
      <Text style={styles.subtitle}>
        Convert your drips to XRP via CoinGate (third-party processor)
      </Text>

      <View style={styles.balanceCard}>
        <MaterialCommunityIcons name="wallet" size={24} color="#4dabf7" />
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{availableBalance.toLocaleString()} drips</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Enter drips to redeem</Text>
        <TextInput
          style={styles.input}
          value={dripsAmount}
          onChangeText={setDripsAmount}
          keyboardType="number-pad"
          placeholder="Enter amount"
          placeholderTextColor="#868e96"
        />
        <Text style={styles.inputHint}>
          Minimum: {MIN_REDEMPTION.toLocaleString()} drips
        </Text>
      </View>

      {!walletAddress && (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#f59f00" />
          <Text style={styles.warningText}>
            You'll need to provide an XRP wallet address to receive your payout
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !isValidAmount && styles.buttonDisabled]}
          onPress={handleProceedFromInput}
          disabled={!isValidAmount || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWalletStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Connect Wallet</Text>
      <Text style={styles.subtitle}>
        Enter your XRP wallet address to receive payouts
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>XRP Wallet Address</Text>
        <TextInput
          style={styles.input}
          value={tempWalletAddress}
          onChangeText={setTempWalletAddress}
          placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          placeholderTextColor="#868e96"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.inputHint}>
          Enter your full XRP wallet address (starts with 'r')
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#fa5252" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={20} color="#4dabf7" />
        <Text style={styles.infoBoxText}>
          CoinGate will send XRP directly to this address. Make sure it's correct - transactions cannot be reversed.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setStep("input")}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, tempWalletAddress.length < 25 && styles.buttonDisabled]}
          onPress={handleSaveWallet}
          disabled={tempWalletAddress.length < 25 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWarningStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.warningHeader}>
        <MaterialCommunityIcons name="alert-octagon" size={48} color="#f59f00" />
        <Text style={styles.warningTitle}>Important Notice</Text>
      </View>

      <View style={styles.conversionPreview}>
        <Text style={styles.conversionText}>
          You are requesting to redeem:
        </Text>
        <Text style={styles.conversionAmount}>{parsedAmount.toLocaleString()} drips</Text>
        <MaterialCommunityIcons name="arrow-down" size={24} color="#4dabf7" />
        <Text style={styles.conversionXrp}>
          ~{xrpAmount?.toFixed(6)} XRP
        </Text>
        <Text style={styles.conversionUsd}>
          (${usdAmount?.toFixed(2)} USD at current rate)
        </Text>
      </View>

      <View style={styles.warningList}>
        <Text style={styles.warningListTitle}>Please review before continuing:</Text>
        
        <View style={styles.warningItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#f59f00" />
          <Text style={styles.warningItemText}>
            Processing typically takes 1-3 business days
          </Text>
        </View>
        
        <View style={styles.warningItem}>
          <MaterialCommunityIcons name="chart-line-variant" size={20} color="#f59f00" />
          <Text style={styles.warningItemText}>
            XRP value may fluctuate; final amount based on rate at processing time
          </Text>
        </View>
        
        <View style={styles.warningItem}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#f59f00" />
          <Text style={styles.warningItemText}>
            CoinGate (third-party processor) will send XRP to your wallet
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setStep("input")}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleProceedToTerms}
        >
          <Text style={styles.continueButtonText}>I Understand</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTermsStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.termsHeader}>
        <MaterialCommunityIcons name="file-document" size={48} color="#4dabf7" />
        <Text style={styles.termsTitle}>Redemption Terms</Text>
      </View>

      <View style={styles.termsList}>
        <Text style={styles.termsListTitle}>By proceeding, you agree to the following:</Text>
        
        <View style={styles.termItem}>
          <MaterialCommunityIcons name="cancel" size={20} color="#868e96" />
          <Text style={styles.termText}>
            <Text style={styles.termBold}>Non-Cancellable:</Text> Once submitted, this redemption request cannot be cancelled or reversed
          </Text>
        </View>
        
        <View style={styles.termItem}>
          <MaterialCommunityIcons name="lock" size={20} color="#868e96" />
          <Text style={styles.termText}>
            <Text style={styles.termBold}>Non-Transferable:</Text> Drips cannot be re-redeemed or transferred to another user
          </Text>
        </View>
        
        <View style={styles.termItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#868e96" />
          <Text style={styles.termText}>
            <Text style={styles.termBold}>Processing Time:</Text> Redemptions are processed within 1-3 business days
          </Text>
        </View>
        
        <View style={styles.termItem}>
          <MaterialCommunityIcons name="bank-transfer" size={20} color="#868e96" />
          <Text style={styles.termText}>
            <Text style={styles.termBold}>Third-Party Processing:</Text> CoinGate handles all payouts. Drip'n does not hold, custody, or transfer funds
          </Text>
        </View>
        
        <View style={styles.termItem}>
          <MaterialCommunityIcons name="account-check" size={20} color="#868e96" />
          <Text style={styles.termText}>
            <Text style={styles.termBold}>Your Responsibility:</Text> Ensure your wallet address is correct. Wrong addresses cannot be recovered
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAcceptedTerms(!acceptedTerms)}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
          {acceptedTerms && (
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.checkboxLabel}>
          I have read and accept these redemption terms
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setStep("warning")}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !acceptedTerms && styles.buttonDisabled]}
          onPress={handleAcceptTerms}
          disabled={!acceptedTerms}
        >
          <Text style={styles.continueButtonText}>Accept & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmHeader}>
        <MaterialCommunityIcons name="help-circle" size={64} color="#4dabf7" />
      </View>

      <Text style={styles.confirmTitle}>Final Confirmation</Text>
      <Text style={styles.confirmSubtitle}>
        You are submitting{" "}
        <Text style={styles.highlightText}>{parsedAmount.toLocaleString()} Drips</Text>
        {" "}to be redeemed?
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Drips to Redeem</Text>
          <Text style={styles.summaryValue}>{parsedAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated XRP</Text>
          <Text style={styles.summaryValue}>~{xrpAmount?.toFixed(6)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Destination</Text>
          <Text style={styles.summaryValueSmall} numberOfLines={1}>
            {effectiveWallet?.substring(0, 12)}...{effectiveWallet?.slice(-8)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={styles.summaryLabel}>Processed By</Text>
          <Text style={styles.summaryValue}>CoinGate</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setStep("terms")}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleFinalSubmit}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <ActivityIndicator size="large" color="#4dabf7" />
      <Text style={styles.processingTitle}>Processing Your Request</Text>
      <Text style={styles.processingSubtitle}>
        Please wait while we submit your redemption to CoinGate...
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <Animated.View
        style={[
          styles.successBanner,
          {
            transform: [{ scale: bannerAnim }],
            opacity: bannerAnim,
          },
        ]}
      >
        <View style={styles.successIconContainer}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#40c057" />
        </View>
        <Text style={styles.successTitle}>Redemption Submitted!</Text>
        <Text style={styles.successAmount}>
          {xrpAmount?.toFixed(6)} XRP
        </Text>
        <Text style={styles.successSubtitle}>
          will be sent to your wallet by CoinGate
        </Text>
        
        {transactionId && (
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction ID</Text>
            <Text style={styles.transactionId}>{transactionId}</Text>
          </View>
        )}
        
        <View style={styles.processingNotice}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#868e96" />
          <Text style={styles.processingNoticeText}>
            Processing takes 1-3 business days. Check History for updates.
          </Text>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <MaterialCommunityIcons name="alert-circle" size={80} color="#fa5252" />
      <Text style={styles.errorTitle}>Something Went Wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setStep("input")}
        >
          <Text style={styles.continueButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case "input":
        return renderInputStep();
      case "wallet":
        return renderWalletStep();
      case "warning":
        return renderWarningStep();
      case "terms":
        return renderTermsStep();
      case "confirm":
        return renderConfirmStep();
      case "processing":
        return renderProcessingStep();
      case "success":
        return renderSuccessStep();
      case "error":
        return renderErrorStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={step === "processing" ? undefined : handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>{renderStep()}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: "70%",
    maxHeight: "90%",
  },
  stepContainer: {
    padding: 25,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#868e96",
    textAlign: "center",
    marginBottom: 25,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252542",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  balanceInfo: {
    marginLeft: 15,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#868e96",
    textTransform: "uppercase",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4dabf7",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#252542",
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#3a3a5c",
  },
  inputHint: {
    fontSize: 12,
    color: "#868e96",
    marginTop: 8,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 159, 0, 0.1)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    color: "#f59f00",
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 82, 82, 0.1)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#fa5252",
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBoxText: {
    color: "#4dabf7",
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#3a3a5c",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#4dabf7",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f59f00",
    marginTop: 10,
  },
  conversionPreview: {
    alignItems: "center",
    backgroundColor: "#252542",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  conversionText: {
    fontSize: 14,
    color: "#868e96",
  },
  conversionAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 5,
  },
  conversionXrp: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4dabf7",
    marginTop: 5,
  },
  conversionUsd: {
    fontSize: 14,
    color: "#868e96",
    marginTop: 5,
  },
  warningList: {
    marginBottom: 20,
  },
  warningListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 5,
  },
  warningItemText: {
    color: "#ccc",
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4dabf7",
    marginTop: 10,
  },
  termsList: {
    marginBottom: 20,
  },
  termsListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingLeft: 5,
  },
  termText: {
    color: "#ccc",
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termBold: {
    fontWeight: "bold",
    color: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#252542",
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4dabf7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4dabf7",
  },
  checkboxLabel: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  confirmHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 25,
  },
  highlightText: {
    color: "#4dabf7",
    fontWeight: "bold",
  },
  summaryCard: {
    backgroundColor: "#252542",
    padding: 20,
    borderRadius: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a5c",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    color: "#868e96",
    fontSize: 14,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryValueSmall: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    maxWidth: 150,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#40c057",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  processingSubtitle: {
    fontSize: 14,
    color: "#868e96",
    marginTop: 10,
    textAlign: "center",
  },
  successBanner: {
    alignItems: "center",
    backgroundColor: "#252542",
    padding: 30,
    borderRadius: 20,
    width: "100%",
  },
  successIconContainer: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#40c057",
    marginBottom: 10,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4dabf7",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#868e96",
    marginTop: 5,
  },
  transactionInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    width: "100%",
  },
  transactionLabel: {
    fontSize: 12,
    color: "#868e96",
    textTransform: "uppercase",
  },
  transactionId: {
    fontSize: 14,
    color: "#4dabf7",
    marginTop: 5,
    fontFamily: "monospace",
  },
  processingNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  processingNoticeText: {
    fontSize: 12,
    color: "#868e96",
    marginLeft: 10,
    flex: 1,
  },
  doneButton: {
    backgroundColor: "#4dabf7",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fa5252",
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 14,
    color: "#868e96",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
