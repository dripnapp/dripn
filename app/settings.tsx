import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../src/store/useStore';

const RESERVED_USERNAMES = ['admin', 'droply', 'system', 'support', 'moderator'];

export default function Settings() {
  const router = useRouter();
  const { username, setUsername, walletAddress, theme, setTheme } = useStore();
  const [newUsername, setNewUsername] = useState(username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const isDark = theme === 'dark';

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

  const displayName = username || (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Not set');

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Profile</Text>
          
          <View style={[styles.settingRow, isDark && styles.settingRowDark]}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="account" size={24} color={isDark ? '#4dabf7' : '#4dabf7'} />
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
          <Text style={[styles.sectionSubtitle, isDark && styles.textMutedDark]}>Choose how droply.io looks to you</Text>

          <View style={styles.themeGrid}>
            <TouchableOpacity 
              style={[
                styles.themeCard, 
                theme === 'classic' && styles.themeCardSelected
              ]} 
              onPress={() => setTheme('classic')}
            >
              <View style={styles.themePreviewClassic}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewHeaderBar} />
                </View>
                <View style={styles.previewContentClassic}>
                  <View style={styles.previewCardClassic} />
                  <View style={styles.previewButtonClassic} />
                </View>
              </View>
              <View style={styles.themeInfo}>
                <View style={styles.themeRadio}>
                  {theme === 'classic' && <View style={styles.themeRadioInner} />}
                </View>
                <Text style={[styles.themeName, theme === 'classic' && styles.themeNameSelected]}>Classic</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeCard, 
                theme === 'dark' && styles.themeCardSelected
              ]} 
              onPress={() => setTheme('dark')}
            >
              <View style={styles.themePreviewDark}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewHeaderBar} />
                </View>
                <View style={styles.previewContentDark}>
                  <View style={styles.previewCardDark} />
                  <View style={styles.previewButtonDark} />
                </View>
              </View>
              <View style={styles.themeInfo}>
                <View style={styles.themeRadio}>
                  {theme === 'dark' && <View style={styles.themeRadioInner} />}
                </View>
                <Text style={[styles.themeName, theme === 'dark' && styles.themeNameSelected]}>Dark</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#1a1a2e' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#0d1117',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionDark: { backgroundColor: '#252542' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 5 },
  sectionSubtitle: { fontSize: 13, color: '#868e96', marginBottom: 20 },
  textDark: { color: '#fff' },
  textMutedDark: { color: '#a0a0a0' },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRowDark: { borderBottomColor: '#3a3a5a' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: 15, flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  settingValue: { fontSize: 13, color: '#868e96', marginTop: 2 },
  editButton: { padding: 8 },
  editButtons: { flexDirection: 'row', gap: 8 },
  saveButton: { backgroundColor: '#4dabf7', padding: 8, borderRadius: 8 },
  cancelButton: { padding: 8 },
  usernameInput: { 
    fontSize: 14, 
    color: '#1a1a1a', 
    borderWidth: 1, 
    borderColor: '#4dabf7', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 6,
    marginTop: 4,
  },
  usernameInputDark: { color: '#fff', borderColor: '#4dabf7', backgroundColor: '#1a1a2e' },
  themeGrid: { flexDirection: 'row', gap: 15 },
  themeCard: { 
    flex: 1, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  themeCardSelected: { borderColor: '#4dabf7' },
  themePreviewClassic: { 
    height: 100, 
    backgroundColor: '#f8f9fa',
  },
  themePreviewDark: { 
    height: 100, 
    backgroundColor: '#1a1a2e',
  },
  previewHeader: { 
    height: 20, 
    backgroundColor: '#0d1117', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  previewHeaderBar: { width: 40, height: 6, backgroundColor: '#4dabf7', borderRadius: 3 },
  previewContentClassic: { flex: 1, padding: 8, justifyContent: 'space-between' },
  previewContentDark: { flex: 1, padding: 8, justifyContent: 'space-between' },
  previewCardClassic: { height: 30, backgroundColor: '#fff', borderRadius: 6 },
  previewCardDark: { height: 30, backgroundColor: '#252542', borderRadius: 6 },
  previewButtonClassic: { height: 20, backgroundColor: '#4dabf7', borderRadius: 4, width: '60%' },
  previewButtonDark: { height: 20, backgroundColor: '#4dabf7', borderRadius: 4, width: '60%' },
  themeInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12,
    backgroundColor: '#fff',
  },
  themeRadio: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  themeRadioInner: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#4dabf7',
  },
  themeName: { fontSize: 14, fontWeight: '600', color: '#495057' },
  themeNameSelected: { color: '#4dabf7' },
});
