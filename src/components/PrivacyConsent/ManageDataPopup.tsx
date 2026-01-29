import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeConfig } from '../../store/useStore';

const { width } = Dimensions.get('window');

interface ManageDataPopupProps {
  visible: boolean;
  onBack: () => void;
  onViewVendors: () => void;
  onSave: (preferences: DataPreferences) => void;
  themeConfig: ThemeConfig;
  initialPreferences?: DataPreferences;
}

export interface DataPreferences {
  personalizedAds: boolean;
  contentMeasurement: boolean;
  audienceResearch: boolean;
  deviceStorage: boolean;
}

export default function ManageDataPopup({
  visible,
  onBack,
  onViewVendors,
  onSave,
  themeConfig,
  initialPreferences,
}: ManageDataPopupProps) {
  const [preferences, setPreferences] = useState<DataPreferences>(
    initialPreferences || {
      personalizedAds: false,
      contentMeasurement: false,
      audienceResearch: false,
      deviceStorage: false,
    }
  );

  const togglePreference = (key: keyof DataPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const acceptAll = () => {
    const allAccepted = {
      personalizedAds: true,
      contentMeasurement: true,
      audienceResearch: true,
      deviceStorage: true,
    };
    setPreferences(allAccepted);
    onSave(allAccepted);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeConfig.card }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={themeConfig.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeConfig.text }]}>Manage your data</Text>
            <TouchableOpacity onPress={onBack} style={styles.closeButton}>
              <MaterialCommunityIcons name="close-circle" size={24} color={themeConfig.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>
              Purpose settings
            </Text>
            <Text style={[styles.sectionDescription, { color: themeConfig.textMuted }]}>
              Manage how your data is used for the following purposes.
            </Text>

            <View style={[styles.preferenceCard, { backgroundColor: themeConfig.background }]}>
              <View style={styles.preferenceHeader}>
                <Text style={[styles.preferenceName, { color: themeConfig.text }]}>
                  Personalised advertising
                </Text>
                <Switch
                  value={preferences.personalizedAds}
                  onValueChange={() => togglePreference('personalizedAds')}
                  trackColor={{ false: themeConfig.textMuted, true: themeConfig.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.preferenceDescription, { color: themeConfig.textMuted }]}>
                Ads can be personalised based on a profile, more data can be used to better personalise ads.
              </Text>
            </View>

            <View style={[styles.preferenceCard, { backgroundColor: themeConfig.background }]}>
              <View style={styles.preferenceHeader}>
                <Text style={[styles.preferenceName, { color: themeConfig.text }]}>
                  Content measurement
                </Text>
                <Switch
                  value={preferences.contentMeasurement}
                  onValueChange={() => togglePreference('contentMeasurement')}
                  trackColor={{ false: themeConfig.textMuted, true: themeConfig.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.preferenceDescription, { color: themeConfig.textMuted }]}>
                Measure ad and content performance to understand audience engagement.
              </Text>
            </View>

            <View style={[styles.preferenceCard, { backgroundColor: themeConfig.background }]}>
              <View style={styles.preferenceHeader}>
                <Text style={[styles.preferenceName, { color: themeConfig.text }]}>
                  Audience research
                </Text>
                <Switch
                  value={preferences.audienceResearch}
                  onValueChange={() => togglePreference('audienceResearch')}
                  trackColor={{ false: themeConfig.textMuted, true: themeConfig.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.preferenceDescription, { color: themeConfig.textMuted }]}>
                Use data to develop and improve services including market research.
              </Text>
            </View>

            <View style={[styles.preferenceCard, { backgroundColor: themeConfig.background }]}>
              <View style={styles.preferenceHeader}>
                <Text style={[styles.preferenceName, { color: themeConfig.text }]}>
                  Device storage
                </Text>
                <Switch
                  value={preferences.deviceStorage}
                  onValueChange={() => togglePreference('deviceStorage')}
                  trackColor={{ false: themeConfig.textMuted, true: themeConfig.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.preferenceDescription, { color: themeConfig.textMuted }]}>
                Store and access information on the device using cookies and similar technologies.
              </Text>
            </View>

            <TouchableOpacity style={styles.vendorLink} onPress={onViewVendors}>
              <Text style={[styles.vendorLinkText, { color: themeConfig.primary }]}>
                View our vendor list
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={themeConfig.primary} />
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptAllButton, { backgroundColor: themeConfig.primary }]}
              onPress={acceptAll}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Accept all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: themeConfig.primary }]}
              onPress={() => onSave(preferences)}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Confirm choices</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  preferenceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  preferenceDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  vendorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  vendorLinkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptAllButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
