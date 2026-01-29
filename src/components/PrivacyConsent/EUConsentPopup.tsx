import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeConfig } from '../../store/useStore';

const { width } = Dimensions.get('window');

interface EUConsentPopupProps {
  visible: boolean;
  onConsent: () => void;
  onDecline: () => void;
  onManageOptions: () => void;
  themeConfig: ThemeConfig;
}

export default function EUConsentPopup({
  visible,
  onConsent,
  onDecline,
  onManageOptions,
  themeConfig,
}: EUConsentPopupProps) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeConfig.card }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onDecline}>
            <MaterialCommunityIcons name="close-circle" size={24} color={themeConfig.textMuted} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Image
              source={require('../../../assets/images/dripn-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: themeConfig.text }]}>
              Drip'n asks for your consent to use your personal data for the following purposes:
            </Text>

            <View style={styles.purposeItem}>
              <View style={[styles.iconCircle, { backgroundColor: themeConfig.primary + '20' }]}>
                <MaterialCommunityIcons name="account" size={20} color={themeConfig.primary} />
              </View>
              <Text style={[styles.purposeText, { color: themeConfig.text }]}>
                Personalised advertising and content, advertising and content measurement, audience research and services development
              </Text>
            </View>

            <View style={styles.purposeItem}>
              <View style={[styles.iconCircle, { backgroundColor: themeConfig.primary + '20' }]}>
                <MaterialCommunityIcons name="database" size={20} color={themeConfig.primary} />
              </View>
              <Text style={[styles.purposeText, { color: themeConfig.text }]}>
                Store and/or access information on a device
              </Text>
            </View>

            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={() => setShowLearnMore(!showLearnMore)}
            >
              <MaterialCommunityIcons
                name={showLearnMore ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={themeConfig.textMuted}
              />
              <Text style={[styles.learnMoreText, { color: themeConfig.textMuted }]}>
                Learn more
              </Text>
            </TouchableOpacity>

            {showLearnMore && (
              <View style={[styles.learnMoreContent, { backgroundColor: themeConfig.background }]}>
                <Text style={[styles.learnMoreDescription, { color: themeConfig.text }]}>
                  Your personal data will be processed and information from your device (cookies, unique identifiers, and other device data) may be stored by, accessed by and shared with our advertising partners, or used specifically by this app.
                </Text>
              </View>
            )}

            <Text style={[styles.disclaimer, { color: themeConfig.textMuted }]}>
              Your personal data will be processed and information from your device (cookies, unique identifiers, and other device data) may be stored by, accessed by and shared with our advertising vendors, or used specifically by this app.
            </Text>

            <Text style={[styles.disclaimer, { color: themeConfig.textMuted }]}>
              Some vendors may process your personal data on the basis of legitimate interest, which you can object to by managing your options below. Look for a link or button in the app menu to manage or withdraw consent in privacy and cookie settings.
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton, { borderColor: themeConfig.primary }]}
              onPress={onDecline}
            >
              <Text style={[styles.buttonText, { color: themeConfig.primary }]}>Do not consent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.consentButton, { backgroundColor: themeConfig.primary }]}
              onPress={onConsent}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Consent</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.manageButton} onPress={onManageOptions}>
            <Text style={[styles.manageText, { color: themeConfig.primary }]}>Manage options</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    maxHeight: '85%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  purposeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  learnMoreText: {
    fontSize: 14,
    marginLeft: 4,
  },
  learnMoreContent: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  learnMoreDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  declineButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  consentButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  manageButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  manageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
