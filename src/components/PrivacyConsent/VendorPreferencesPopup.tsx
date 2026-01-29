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
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeConfig } from '../../store/useStore';

const { width } = Dimensions.get('window');

interface VendorPreferencesPopupProps {
  visible: boolean;
  onBack: () => void;
  onSave: (vendorConsents: VendorConsents) => void;
  themeConfig: ThemeConfig;
  initialConsents?: VendorConsents;
}

export interface VendorConsents {
  admob: boolean;
  cpx: boolean;
  unityAds: boolean;
}

interface Vendor {
  id: keyof VendorConsents;
  name: string;
  cookieDuration: string;
  dataCollected: string;
  privacyPolicy: string;
}

const VENDORS: Vendor[] = [
  {
    id: 'admob',
    name: 'Google AdMob',
    cookieDuration: '540 (days)',
    dataCollected: 'IP addresses, Device identifiers, Browsing history',
    privacyPolicy: 'https://policies.google.com/privacy',
  },
  {
    id: 'cpx',
    name: 'CPX Research',
    cookieDuration: '365 (days)',
    dataCollected: 'IP addresses, Device identifiers, Survey responses',
    privacyPolicy: 'https://www.cpx-research.com/main/en/privacy.php',
  },
  {
    id: 'unityAds',
    name: 'Unity Ads',
    cookieDuration: '365 (days)',
    dataCollected: 'IP addresses, Device identifiers, App usage',
    privacyPolicy: 'https://unity3d.com/legal/privacy-policy',
  },
];

export default function VendorPreferencesPopup({
  visible,
  onBack,
  onSave,
  themeConfig,
  initialConsents,
}: VendorPreferencesPopupProps) {
  const [consents, setConsents] = useState<VendorConsents>(
    initialConsents || {
      admob: false,
      cpx: false,
      unityAds: false,
    }
  );

  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const toggleConsent = (vendorId: keyof VendorConsents) => {
    setConsents((prev) => ({ ...prev, [vendorId]: !prev[vendorId] }));
  };

  const acceptAll = () => {
    const allAccepted = {
      admob: true,
      cpx: true,
      unityAds: true,
    };
    setConsents(allAccepted);
    onSave(allAccepted);
  };

  const openPrivacyPolicy = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeConfig.card }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={themeConfig.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeConfig.text }]}>Vendor preferences</Text>
            <TouchableOpacity onPress={onBack} style={styles.closeButton}>
              <MaterialCommunityIcons name="close-circle" size={24} color={themeConfig.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <Text style={[styles.sectionTitle, { color: themeConfig.text }]}>
              Confirm our vendors
            </Text>
            <Text style={[styles.sectionDescription, { color: themeConfig.textMuted }]}>
              Vendors can use your data to provide services. Declining a vendor can stop them from using the data you shared.
            </Text>

            <View style={[styles.tcfBadge, { backgroundColor: themeConfig.background }]}>
              <Text style={[styles.tcfText, { color: themeConfig.textMuted }]}>TCF vendors</Text>
              <MaterialCommunityIcons name="help-circle-outline" size={16} color={themeConfig.textMuted} />
            </View>

            {VENDORS.map((vendor) => (
              <View key={vendor.id} style={[styles.vendorCard, { backgroundColor: themeConfig.background }]}>
                <View style={styles.vendorHeader}>
                  <Text style={[styles.vendorName, { color: themeConfig.text }]}>{vendor.name}</Text>
                </View>

                <Text style={[styles.vendorDetail, { color: themeConfig.textMuted }]}>
                  Cookie duration: {vendor.cookieDuration}.
                </Text>
                <Text style={[styles.vendorDetail, { color: themeConfig.textMuted }]} numberOfLines={expandedVendor === vendor.id ? undefined : 1}>
                  Data collected and processed: {vendor.dataCollected}
                  {expandedVendor !== vendor.id && '...'}
                  {expandedVendor !== vendor.id && (
                    <Text style={{ color: themeConfig.primary }} onPress={() => setExpandedVendor(vendor.id)}> more</Text>
                  )}
                </Text>
                {expandedVendor === vendor.id && (
                  <Text style={[styles.vendorDetail, { color: themeConfig.textMuted }]}>
                    Cookie duration resets each session.
                  </Text>
                )}

                <View style={styles.vendorLinks}>
                  <TouchableOpacity onPress={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}>
                    <Text style={[styles.linkText, { color: themeConfig.primary }]}>View details</Text>
                  </TouchableOpacity>
                  <Text style={[styles.linkSeparator, { color: themeConfig.textMuted }]}>|</Text>
                  <TouchableOpacity onPress={() => openPrivacyPolicy(vendor.privacyPolicy)}>
                    <Text style={[styles.linkText, { color: themeConfig.primary }]}>
                      Privacy policy
                      <MaterialCommunityIcons name="open-in-new" size={12} color={themeConfig.primary} />
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.consentRow}>
                  <Text style={[styles.consentLabel, { color: themeConfig.text }]}>Consent</Text>
                  <Switch
                    value={consents[vendor.id]}
                    onValueChange={() => toggleConsent(vendor.id)}
                    trackColor={{ false: themeConfig.textMuted, true: themeConfig.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            ))}
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
              onPress={() => onSave(consents)}
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
    marginBottom: 16,
  },
  tcfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 4,
  },
  tcfText: {
    fontSize: 13,
  },
  vendorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vendorHeader: {
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  vendorDetail: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  vendorLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  linkSeparator: {
    marginHorizontal: 8,
  },
  consentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  consentLabel: {
    fontSize: 14,
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
