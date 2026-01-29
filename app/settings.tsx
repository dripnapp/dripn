import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, ThemeMode, THEME_CONFIGS } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';
import { EUConsentPopup, ManageDataPopup, VendorPreferencesPopup, USDataPreferencesPopup } from '../src/components/PrivacyConsent';
import { DataPreferences } from '../src/components/PrivacyConsent/ManageDataPopup';
import { VendorConsents } from '../src/components/PrivacyConsent/VendorPreferencesPopup';

const RESERVED_USERNAMES = ['admin', 'dripn', 'system', 'support', 'moderator'];

const THEMES: { id: ThemeMode; name: string; color: string; bgColor: string; preview: { header: string; card: string; button: string } }[] = [
  { 
    id: 'classic', 
    name: 'Classic', 
    color: THEME_CONFIGS.classic.primary, 
    bgColor: THEME_CONFIGS.classic.background,
    preview: { header: THEME_CONFIGS.classic.headerBg, card: THEME_CONFIGS.classic.card, button: THEME_CONFIGS.classic.primary }
  },
  { 
    id: 'dark', 
    name: 'Dark', 
    color: THEME_CONFIGS.dark.primary, 
    bgColor: THEME_CONFIGS.dark.background,
    preview: { header: THEME_CONFIGS.dark.headerBg, card: THEME_CONFIGS.dark.card, button: THEME_CONFIGS.dark.primary }
  },
  { 
    id: 'neon', 
    name: 'Neon', 
    color: THEME_CONFIGS.neon.primary, 
    bgColor: THEME_CONFIGS.neon.background,
    preview: { header: THEME_CONFIGS.neon.headerBg, card: THEME_CONFIGS.neon.card, button: THEME_CONFIGS.neon.primary }
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    color: THEME_CONFIGS.ocean.primary, 
    bgColor: THEME_CONFIGS.ocean.background,
    preview: { header: THEME_CONFIGS.ocean.headerBg, card: THEME_CONFIGS.ocean.card, button: THEME_CONFIGS.ocean.primary }
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    color: THEME_CONFIGS.sunset.primary, 
    bgColor: THEME_CONFIGS.sunset.background,
    preview: { header: THEME_CONFIGS.sunset.headerBg, card: THEME_CONFIGS.sunset.card, button: THEME_CONFIGS.sunset.primary }
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    color: THEME_CONFIGS.forest.primary, 
    bgColor: THEME_CONFIGS.forest.background,
    preview: { header: THEME_CONFIGS.forest.headerBg, card: THEME_CONFIGS.forest.card, button: THEME_CONFIGS.forest.primary }
  },
];

export default function Settings() {
  const { 
    username, uniqueId, setUsername, theme, setTheme, unlockedThemes, unlockTheme, points,
    privacyConsent, revokePrivacyConsent, setEUConsent, setEUDataPreferences, setEUVendorConsents,
    setUSDataSharing, completePrivacySetup
  } = useStore();
  const [newUsername, setNewUsername] = useState(username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  
  const [showEUConsent, setShowEUConsent] = useState(false);
  const [showManageData, setShowManageData] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [showUSPreferences, setShowUSPreferences] = useState(false);

  const themeConfig = THEME_CONFIGS[theme];
  const isDark = themeConfig.isDark;

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

  const handleManagePrivacy = () => {
    if (privacyConsent.region === 'EU') {
      setShowEUConsent(true);
    } else if (privacyConsent.region === 'US') {
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

  const handleSaveUsername = () => {
    const trimmed = newUsername.trim();
    if (trimmed.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert('Invalid Username', 'Username must be 20 characters or less.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (RESERVED_USERNAMES.includes(trimmed.toLowerCase())) {
      Alert.alert('Invalid Username', 'This username is reserved.');
      return;
    }
    setUsername(trimmed);
    setIsEditingUsername(false);
  };

  const handleThemePress = (targetTheme: ThemeMode) => {
    if (unlockedThemes.includes(targetTheme)) {
      setTheme(targetTheme);
    } else {
      Alert.alert(
        'Unlock Theme',
        `Unlock the ${targetTheme} theme for 1,000 drips?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unlock', 
            onPress: () => {
              const success = unlockTheme(targetTheme);
              if (success) {
                setTheme(targetTheme);
                Alert.alert('Success', `${targetTheme} theme unlocked!`);
              } else {
                Alert.alert('Insufficient Drips', 'You need 1,000 drips to unlock this theme.');
              }
            }
          }
        ]
      );
    }
  };

  const displayName = username || 'Not set';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AppHeader title="Settings" showBack />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.section, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Profile</Text>
          
          <View style={[styles.settingRow]}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="account" size={24} color={themeConfig.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: themeConfig.text }]}>Username</Text>
                {isEditingUsername ? (
                  <TextInput
                    style={[styles.usernameInput, { color: themeConfig.text, borderColor: themeConfig.primary, backgroundColor: themeConfig.background }]}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Enter username"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    autoFocus
                    maxLength={20}
                  />
                ) : (
                  <>
                    <Text style={[styles.settingValue, { color: themeConfig.textMuted }]}>{displayName}</Text>
                    {uniqueId && (
                      <View style={styles.uniqueIdRow}>
                        <Text style={[styles.uniqueIdText, { color: themeConfig.textMuted }]}>ID: #{uniqueId}</Text>
                        <TouchableOpacity onPress={() => {
                          // Copy logic could go here
                          Alert.alert('Copied', 'ID copied to clipboard!');
                        }}>
                          <MaterialCommunityIcons name="content-copy" size={14} color={themeConfig.primary} style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
            {isEditingUsername ? (
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsEditingUsername(false); setNewUsername(username || ''); }}>
                  <MaterialCommunityIcons name="close" size={20} color="#868e96" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingUsername(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={themeConfig.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Appearance</Text>
          <Text style={[styles.sectionSubtitle, { color: themeConfig.textMuted }]}>Choose how Drip'n looks to you</Text>

          <View style={styles.themeGrid}>
            {THEMES.map((t) => {
              const isUnlocked = unlockedThemes.includes(t.id);
              const isSelected = theme === t.id;
              
              return (
                <TouchableOpacity 
                  key={t.id}
                  style={[
                    styles.themeCard, 
                    isSelected && { borderColor: themeConfig.primary },
                  ]} 
                  onPress={() => handleThemePress(t.id)}
                >
                  <View style={[styles.themePreview, { backgroundColor: t.bgColor }]}>
                    <View style={[styles.previewHeader, { backgroundColor: t.preview.header }]}>
                      <View style={styles.previewHeaderBar} />
                    </View>
                    <View style={styles.previewContent}>
                       <View style={[styles.previewCard, { backgroundColor: t.preview.card }]} />
                       <View style={[styles.previewButton, { backgroundColor: t.preview.button }]} />
                    </View>
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <MaterialCommunityIcons name="lock" size={24} color="#fff" />
                        <Text style={styles.lockText}>1,000 drips</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.themeInfo, { backgroundColor: themeConfig.card }]}>
                    <View style={[styles.themeRadio, { borderColor: themeConfig.primary }]}>
                      {isSelected && <View style={[styles.themeRadioInner, { backgroundColor: themeConfig.primary }]} />}
                    </View>
                    <Text style={[styles.themeName, { color: isSelected ? themeConfig.primary : themeConfig.text }]}>{t.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeConfig.card }]}>
          <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>Privacy</Text>
          <Text style={[styles.sectionSubtitle, { color: themeConfig.textMuted }]}>Manage your data and privacy preferences</Text>
          
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: themeConfig.background }]}
            onPress={handleManagePrivacy}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="shield-account" size={24} color={themeConfig.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: themeConfig.text }]}>Manage Privacy Settings</Text>
                <Text style={[styles.settingValue, { color: themeConfig.textMuted }]}>
                  {privacyConsent.hasCompletedPrivacySetup ? 'Update your preferences' : 'Set up privacy preferences'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={themeConfig.textMuted} />
          </TouchableOpacity>

          {privacyConsent.hasCompletedPrivacySetup && (
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleRevokeConsent}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="shield-remove" size={24} color="#e74c3c" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: themeConfig.text }]}>Revoke Consent</Text>
                  <Text style={[styles.settingValue, { color: themeConfig.textMuted }]}>
                    Withdraw your privacy consent
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={themeConfig.textMuted} />
            </TouchableOpacity>
          )}

          {privacyConsent.consentTimestamp && (
            <Text style={[styles.consentDate, { color: themeConfig.textMuted }]}>
              Last updated: {new Date(privacyConsent.consentTimestamp).toLocaleDateString()}
            </Text>
          )}
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#1a1a2e' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  textDark: { color: '#fff' },
  textMutedDark: { color: '#a0a0a0' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionDark: { backgroundColor: '#252542' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 15 },
  sectionSubtitle: { fontSize: 13, color: '#868e96', marginBottom: 15, marginTop: -10 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingRowDark: { borderBottomColor: '#3a3a5a' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: 12, flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  settingValue: { fontSize: 13, color: '#868e96', marginTop: 2 },
  uniqueIdRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  uniqueIdText: { fontSize: 12, color: '#868e96' },
  editButton: { padding: 8 },
  editButtons: { flexDirection: 'row', alignItems: 'center' },
  saveButton: {
    backgroundColor: '#40c057',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
    padding: 8,
    borderRadius: 8,
  },
  usernameInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    marginTop: 4,
  },
  usernameInputDark: {
    borderColor: '#3a3a5a',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    marginBottom: 15,
  },
  themeCardSelected: { borderColor: '#4dabf7' },
  themePreview: { height: 100, overflow: 'hidden' },
  previewHeader: { height: 15, justifyContent: 'center', alignItems: 'center' },
  previewHeaderBar: { width: 30, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  previewContent: { padding: 10, flex: 1, justifyContent: 'center' },
  previewCard: { height: 30, borderRadius: 6, marginBottom: 8, opacity: 0.8 },
  previewButton: { height: 15, width: '60%', borderRadius: 4, opacity: 0.8 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  themeInfo: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff' },
  themeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4dabf7',
  },
  themeName: { marginLeft: 8, fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  themeNameSelected: { color: '#4dabf7' },
  consentDate: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
