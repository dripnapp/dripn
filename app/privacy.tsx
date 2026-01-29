import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, THEME_CONFIGS } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';
import { EUConsentPopup, ManageDataPopup, VendorPreferencesPopup, USDataPreferencesPopup } from '../src/components/PrivacyConsent';
import type { DataPreferences } from '../src/components/PrivacyConsent/ManageDataPopup';
import type { VendorConsents } from '../src/components/PrivacyConsent/VendorPreferencesPopup';

export default function Privacy() {
  const { 
    theme, privacyConsent, revokePrivacyConsent, setEUConsent, setEUDataPreferences, 
    setEUVendorConsents, setUSDataSharing, completePrivacySetup, setPrivacyRegion
  } = useStore();
  
  const [showEUConsent, setShowEUConsent] = useState(false);
  const [showManageData, setShowManageData] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [showUSPreferences, setShowUSPreferences] = useState(false);

  const themeConfig = THEME_CONFIGS[theme];

  const handleRevokeConsent = () => {
    Alert.alert(
      'Revoke Privacy Consent',
      'This will reset your privacy preferences. You will need to set them up again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive',
          onPress: () => {
            revokePrivacyConsent();
            Alert.alert('Done', 'Your privacy consent has been revoked. You will see the privacy setup again next time you open the app.');
          }
        }
      ]
    );
  };

  const handleManagePrivacy = async () => {
    let region = privacyConsent.region;
    
    if (!region) {
      const { detectUserRegion } = await import('../src/utils/regionDetection');
      region = await detectUserRegion();
      setPrivacyRegion(region);
    }
    
    if (region === 'EU') {
      setShowEUConsent(true);
    } else if (region === 'US') {
      setShowUSPreferences(true);
    } else {
      Alert.alert('Privacy Settings', 'Privacy settings are available for EU and US users.');
    }
  };

  const handleEUConsent = () => {
    setEUConsent(true);
    setShowEUConsent(false);
    completePrivacySetup();
  };

  const handleEUDecline = () => {
    setEUConsent(false);
    setShowEUConsent(false);
    completePrivacySetup();
  };

  const handleDataPreferencesSave = (prefs: DataPreferences) => {
    setEUDataPreferences(prefs);
    setShowManageData(false);
    completePrivacySetup();
  };

  const handleVendorConsentsSave = (consents: VendorConsents) => {
    setEUVendorConsents(consents);
    setShowVendors(false);
    setShowManageData(false);
    completePrivacySetup();
  };

  const handleUSPreferencesSave = (allow: boolean) => {
    setUSDataSharing(allow);
    setShowUSPreferences(false);
    completePrivacySetup();
  };

  const getConsentStatus = () => {
    if (!privacyConsent.hasCompletedPrivacySetup) return 'Not configured';
    if (privacyConsent.region === 'EU') {
      return privacyConsent.euConsent ? 'Consent given' : 'Consent declined';
    }
    if (privacyConsent.region === 'US') {
      return privacyConsent.usAllowDataSharing ? 'Data sharing allowed' : 'Data sharing declined';
    }
    return 'Configured';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader title="Privacy Settings" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.section, { backgroundColor: themeConfig.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-lock" size={28} color={themeConfig.primary} />
            <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Your Privacy</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: themeConfig.textMuted }]}>
            Manage how your data is collected and used for personalized ads and content.
          </Text>

          <View style={[styles.statusCard, { backgroundColor: themeConfig.background }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: themeConfig.textMuted }]}>Region</Text>
              <Text style={[styles.statusValue, { color: themeConfig.text }]}>
                {privacyConsent.region === 'EU' ? 'European Union' : 
                 privacyConsent.region === 'US' ? 'United States' : 'Not detected'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: themeConfig.textMuted }]}>Status</Text>
              <Text style={[styles.statusValue, { color: themeConfig.primary }]}>{getConsentStatus()}</Text>
            </View>
            {privacyConsent.consentTimestamp && (
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: themeConfig.textMuted }]}>Last Updated</Text>
                <Text style={[styles.statusValue, { color: themeConfig.text }]}>
                  {new Date(privacyConsent.consentTimestamp).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: themeConfig.primary }]}
            onPress={handleManagePrivacy}
          >
            <MaterialCommunityIcons name="shield-account" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>
              {privacyConsent.hasCompletedPrivacySetup ? 'Update Privacy Preferences' : 'Set Up Privacy Preferences'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {privacyConsent.hasCompletedPrivacySetup && (
            <TouchableOpacity 
              style={[styles.revokeButton, { borderColor: '#e74c3c' }]}
              onPress={handleRevokeConsent}
            >
              <MaterialCommunityIcons name="shield-remove" size={22} color="#e74c3c" />
              <Text style={[styles.revokeButtonText, { color: '#e74c3c' }]}>Revoke Consent</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: themeConfig.card }]}>
          <MaterialCommunityIcons name="information" size={20} color={themeConfig.primary} />
          <Text style={[styles.infoText, { color: themeConfig.textMuted }]}>
            Your privacy choices are stored locally on your device and apply to personalized advertising. 
            You can change your preferences at any time.
          </Text>
        </View>
      </ScrollView>

      <EUConsentPopup
        visible={showEUConsent}
        onConsent={handleEUConsent}
        onDecline={handleEUDecline}
        onManageOptions={() => {
          setShowEUConsent(false);
          setShowManageData(true);
        }}
        themeConfig={themeConfig}
      />

      <ManageDataPopup
        visible={showManageData}
        onBack={() => {
          setShowManageData(false);
          setShowEUConsent(true);
        }}
        onViewVendors={() => {
          setShowManageData(false);
          setShowVendors(true);
        }}
        onSave={handleDataPreferencesSave}
        themeConfig={themeConfig}
        initialPreferences={privacyConsent.euDataPreferences || undefined}
      />

      <VendorPreferencesPopup
        visible={showVendors}
        onBack={() => {
          setShowVendors(false);
          setShowManageData(true);
        }}
        onSave={handleVendorConsentsSave}
        themeConfig={themeConfig}
        initialConsents={privacyConsent.euVendorConsents || undefined}
      />

      <USDataPreferencesPopup
        visible={showUSPreferences}
        onSave={handleUSPreferencesSave}
        onClose={() => setShowUSPreferences(false)}
        themeConfig={themeConfig}
        initialPreference={privacyConsent.usAllowDataSharing !== null ? privacyConsent.usAllowDataSharing : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  content: { 
    flex: 1 
  },
  contentContainer: { 
    padding: 20 
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1a1a1a',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#868e96',
    lineHeight: 20,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#868e96',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4dabf7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  revokeButtonText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#868e96',
    lineHeight: 18,
    marginLeft: 12,
  },
});
