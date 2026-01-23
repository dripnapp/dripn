import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, ThemeMode } from '../src/store/useStore';
import AppHeader from '../src/components/AppHeader';

const RESERVED_USERNAMES = ['admin', 'dripn', 'system', 'support', 'moderator'];

const THEMES: { id: ThemeMode; name: string; color: string; bgColor: string }[] = [
  { id: 'classic', name: 'Classic', color: '#4dabf7', bgColor: '#f8f9fa' },
  { id: 'dark', name: 'Dark', color: '#4dabf7', bgColor: '#1a1a2e' },
  { id: 'neon', name: 'Neon', color: '#00ff41', bgColor: '#0d0d0d' },
  { id: 'ocean', name: 'Ocean', color: '#0077be', bgColor: '#e0f2f1' },
  { id: 'sunset', name: 'Sunset', color: '#ff4e50', bgColor: '#fff3e0' },
  { id: 'forest', name: 'Forest', color: '#2d5a27', bgColor: '#f1f8e9' },
];

export default function Settings() {
  const { username, setUsername, theme, setTheme, unlockedThemes, unlockTheme, points } = useStore();
  const [newUsername, setNewUsername] = useState(username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const isDark = theme === 'dark' || theme === 'neon';

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
    Alert.alert('Success', 'Username updated!');
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
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Profile</Text>
          
          <View style={[styles.settingRow, isDark && styles.settingRowDark]}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="account" size={24} color="#4dabf7" />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, isDark && styles.textDark]}>Username</Text>
                {isEditingUsername ? (
                  <TextInput
                    style={[styles.usernameInput, isDark && styles.usernameInputDark]}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Enter username"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    autoFocus
                    maxLength={20}
                  />
                ) : (
                  <Text style={[styles.settingValue, isDark && styles.textMutedDark]}>{displayName}</Text>
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
                <MaterialCommunityIcons name="pencil" size={20} color="#4dabf7" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Appearance</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.textMutedDark]}>Choose how Drip'n looks to you</Text>

          <View style={styles.themeGrid}>
            {THEMES.map((t) => {
              const isUnlocked = unlockedThemes.includes(t.id);
              const isSelected = theme === t.id;
              
              return (
                <TouchableOpacity 
                  key={t.id}
                  style={[
                    styles.themeCard, 
                    isSelected && styles.themeCardSelected,
                    !isUnlocked && styles.themeCardLocked
                  ]} 
                  onPress={() => handleThemePress(t.id)}
                >
                  <View style={[styles.themePreview, { backgroundColor: t.bgColor }]}>
                    <View style={styles.previewHeader}>
                      <View style={styles.previewHeaderBar} />
                    </View>
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <MaterialCommunityIcons name="lock" size={24} color="#fff" />
                        <Text style={styles.lockText}>1,000 drips</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.themeInfo}>
                    <View style={styles.themeRadio}>
                      {isSelected && <View style={styles.themeRadioInner} />}
                    </View>
                    <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>{t.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
  themeCardLocked: { opacity: 0.8 },
  themePreview: { height: 80, justifyContent: 'center' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  previewHeader: { height: 15, backgroundColor: '#12122a', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, width: '100%' },
  previewHeaderBar: { width: 30, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
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
});
