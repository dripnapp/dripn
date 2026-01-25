import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
}

export default function AppHeader({ title, showBack = false, showLogo = false }: AppHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuOpen(false)} activeOpacity={1}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/'); }}>
              <MaterialCommunityIcons name="home" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/history'); }}>
              <MaterialCommunityIcons name="history" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/learn'); }}>
              <MaterialCommunityIcons name="school" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Learn Crypto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/referral'); }}>
              <MaterialCommunityIcons name="account-group" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Referral Program</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/badges'); }}>
              <MaterialCommunityIcons name="medal" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Badges & Levels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/leaderboard'); }}>
              <MaterialCommunityIcons name="podium" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Leaderboard</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/legal'); }}>
              <MaterialCommunityIcons name="shield-check" size={22} color="#868e96" />
              <Text style={styles.menuText}>Legal Disclaimers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/terms'); }}>
              <MaterialCommunityIcons name="file-document" size={22} color="#868e96" />
              <Text style={styles.menuText}>Terms of Use</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/settings'); }}>
              <MaterialCommunityIcons name="cog" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push('/contact'); }}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#4dabf7" />
              <Text style={styles.menuText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {showLogo ? (
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/dripn-logo.jpg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}

        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 52,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    padding: 10,
    width: 46,
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 46,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: -46,
  },
  logo: {
    width: 180,
    height: 38,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  menuButton: {
    padding: 10,
    width: 46,
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 6,
    marginHorizontal: 16,
  },
});
