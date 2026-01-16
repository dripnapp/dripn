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
    backgroundColor: '#12122a',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
    width: 44,
  },
  placeholder: {
    width: 44,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: -44,
  },
  logo: {
    width: 200,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
    width: 44,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
});
