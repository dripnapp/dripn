import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabase"; // Make sure this import exists
import { useStore } from "../store/useStore";

interface UsernameSetupProps {
  visible: boolean;
  currentUsername: string | null;
  onSave: (username: string) => void;
  onClose: () => void;
}

const RESERVED_NAMES = [
  "admin",
  "administrator",
  "mod",
  "moderator",
  "support",
  "help",
  "cryptoking",
  "xrphunter",
  "rewardchaser",
  "tokenmaster",
  "blockexplorer",
  "coincollector",
  "digiearner",
  "cashflowpro",
  "dripspilot",
  "rewardrookie",
  "dripn",
  "system",
  "bot",
  "official",
];

export default function UsernameSetup({
  visible,
  currentUsername,
  onSave,
  onClose,
}: UsernameSetupProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const validateUsername = (name: string): string | null => {
    if (name.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (name.length > 20) {
      return "Username must be 20 characters or less";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return "Only letters, numbers, and underscores allowed";
    }
    if (RESERVED_NAMES.includes(name.toLowerCase())) {
      return "This username is not available";
    }
    return null;
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    const validationError = validateUsername(trimmedUsername);

    if (validationError) {
      setError(validationError);
      return;
    }

    setChecking(true);
    setError("");

    try {
      // 1. Check for existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // User already signed in → update username in DB
        const { error: updateError } = await supabase
          .from("users")
          .update({ username: trimmedUsername })
          .eq("id", session.user.id);

        if (updateError) throw updateError;

        useStore.getState().setUsername(trimmedUsername);
        Alert.alert("Success", "Username updated!");
        onSave(trimmedUsername);
        onClose();
        return;
      }

      // 2. New user → sign up with Supabase
      // Temp email (replace with real email input field later)
      const tempEmail = `${trimmedUsername.toLowerCase().replace(/\s+/g, "")}@dripn.local`;
      const tempPassword = "tempSecurePass123!"; // Replace with real password prompt later

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            username: trimmedUsername,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Explicitly create the user row if the trigger didn't handle it or to be safe
        const { error: insertError } = await supabase
          .from("users")
          .upsert({ 
            id: data.user.id,
            username: trimmedUsername,
            total_earned: 0,
            points: 0
          }, { onConflict: 'id' });

        if (insertError) {
          console.warn("Manual user row insertion error (might already exist):", insertError);
        }

        useStore.getState().setUsername(trimmedUsername);
        Alert.alert("Welcome!", "Account created successfully.");
        onSave(trimmedUsername);
        onClose();
      }
    } catch (err: any) {
      console.error("Username save failed:", err);
      setError(err.message || "Failed to save username. Please try again.");
      Alert.alert("Error", err.message || "Failed to create/update account.");
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setError("");
  };

  const handleClose = () => {
    if (!currentUsername && !username.trim()) {
      Alert.alert(
        "Account Required",
        "You must create a username to continue.",
      );
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account-edit"
              size={48}
              color="#4dabf7"
            />
          </View>

          <Text style={styles.title}>Set Your Username</Text>
          <Text style={styles.subtitle}>
            Choose a unique username for your profile. This will be displayed on
            leaderboards.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Enter username"
              placeholderTextColor="#adb5bd"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <Text style={styles.charCount}>{username.length}/20</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={16}
                color="#fa5252"
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Username rules:</Text>
            <Text style={styles.rule}>• 3-20 characters</Text>
            <Text style={styles.rule}>
              • Letters, numbers, and underscores only
            </Text>
            <Text style={styles.rule}>• Must be unique</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, checking && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Username</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Styles remain exactly the same as your original
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1a1a1a",
  },
  inputError: {
    borderColor: "#fa5252",
  },
  charCount: {
    position: "absolute",
    right: 15,
    color: "#adb5bd",
    fontSize: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  errorText: {
    color: "#fa5252",
    fontSize: 13,
    marginLeft: 6,
  },
  rulesContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  rule: {
    fontSize: 12,
    color: "#666",
    marginVertical: 2,
  },
  saveButton: {
    backgroundColor: "#4dabf7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#adb5bd",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
