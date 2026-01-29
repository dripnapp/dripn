import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeConfig } from '../../store/useStore';

const { width } = Dimensions.get('window');

interface USDataPreferencesPopupProps {
  visible: boolean;
  onSave: (allowDataSharing: boolean) => void;
  onClose: () => void;
  themeConfig: ThemeConfig;
  initialPreference?: boolean;
}

export default function USDataPreferencesPopup({
  visible,
  onSave,
  onClose,
  themeConfig,
  initialPreference,
}: USDataPreferencesPopupProps) {
  const [allowDataSharing, setAllowDataSharing] = useState<boolean | null>(
    initialPreference !== undefined ? initialPreference : null
  );

  const handleSave = () => {
    if (allowDataSharing !== null) {
      onSave(allowDataSharing);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeConfig.card }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close-circle" size={24} color={themeConfig.textMuted} />
          </TouchableOpacity>

          <Image
            source={require('../../../assets/images/dripn-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: themeConfig.text }]}>
            My data preferences
          </Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: themeConfig.background, borderColor: allowDataSharing === true ? themeConfig.primary : 'transparent' },
              allowDataSharing === true && styles.optionSelected,
            ]}
            onPress={() => setAllowDataSharing(true)}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radioOuter, { borderColor: allowDataSharing === true ? themeConfig.primary : themeConfig.textMuted }]}>
                {allowDataSharing === true && (
                  <View style={[styles.radioInner, { backgroundColor: themeConfig.primary }]} />
                )}
              </View>
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: themeConfig.text }]}>
                Allow the sale or sharing of my data
              </Text>
              <Text style={[styles.optionDescription, { color: themeConfig.textMuted }]}>
                By allowing the sale or sharing of your data, you will see interest-based ads on our sites
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: themeConfig.background, borderColor: allowDataSharing === false ? themeConfig.primary : 'transparent' },
              allowDataSharing === false && styles.optionSelected,
            ]}
            onPress={() => setAllowDataSharing(false)}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radioOuter, { borderColor: allowDataSharing === false ? themeConfig.primary : themeConfig.textMuted }]}>
                {allowDataSharing === false && (
                  <View style={[styles.radioInner, { backgroundColor: themeConfig.primary }]} />
                )}
              </View>
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: themeConfig.text }]}>
                Don't sell or share my data
              </Text>
              <Text style={[styles.optionDescription, { color: themeConfig.textMuted }]}>
                We won't sell or share your personal information to inform the ads you see. You may still see interest-based ads if your information is sold or shared by other companies or was sold or shared previously.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: allowDataSharing !== null ? themeConfig.primary : themeConfig.textMuted },
            ]}
            onPress={handleSave}
            disabled={allowDataSharing === null}
          >
            <Text style={[styles.saveButtonText, { color: '#fff' }]}>Save and close</Text>
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
    borderRadius: 16,
    padding: 24,
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
  logo: {
    width: 70,
    height: 70,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionSelected: {
    borderWidth: 2,
  },
  radioContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
