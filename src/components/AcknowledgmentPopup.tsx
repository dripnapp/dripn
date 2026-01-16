import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AcknowledgmentPopupProps {
  visible: boolean;
  onAccept: () => void;
}

export default function AcknowledgmentPopup({ visible, onAccept }: AcknowledgmentPopupProps) {
  const router = useRouter();
  const [checks, setChecks] = useState({
    volatility: false,
    age: false,
    risks: false,
    terms: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTermsPress = () => {
    router.push('/terms');
  };

  const CheckItem = ({ checked, onPress, children }: { checked: boolean; onPress: () => void; children: React.ReactNode }) => (
    <TouchableOpacity style={styles.checkItem} onPress={onPress}>
      <MaterialCommunityIcons 
        name={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
        size={24} 
        color={checked ? "#4dabf7" : "#868e96"} 
      />
      <View style={styles.checkLabelContainer}>
        {children}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Important Acknowledgments</Text>
          <Text style={styles.description}>
            Please read and accept the following before using Drip'n:
          </Text>
          
          <ScrollView style={styles.checkList}>
            <CheckItem 
              checked={checks.volatility} 
              onPress={() => toggleCheck('volatility')}
            >
              <Text style={styles.checkLabel}>
                I understand XRP price is volatile and payout value may change at any time.
              </Text>
            </CheckItem>
            <CheckItem 
              checked={checks.age} 
              onPress={() => toggleCheck('age')}
            >
              <Text style={styles.checkLabel}>
                I confirm I am 18 years of age or older.
              </Text>
            </CheckItem>
            <CheckItem 
              checked={checks.risks} 
              onPress={() => toggleCheck('risks')}
            >
              <Text style={styles.checkLabel}>
                I acknowledge payouts are in XRP at current market rate at time of cashout.
              </Text>
            </CheckItem>
            <CheckItem 
              checked={checks.terms} 
              onPress={() => toggleCheck('terms')}
            >
              <Text style={styles.checkLabel}>
                I have read and agree to the{' '}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  Terms of Use and Privacy Policy
                </Text>
                .
              </Text>
            </CheckItem>
          </ScrollView>

          <TouchableOpacity 
            style={[styles.acceptButton, !allChecked && styles.acceptButtonDisabled]} 
            onPress={onAccept}
            disabled={!allChecked}
          >
            <Text style={styles.acceptButtonText}>Continue to Drip'n</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  checkList: {
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkLabelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  checkLabel: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  termsLink: {
    color: '#4dabf7',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#4dabf7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#dee2e6',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
