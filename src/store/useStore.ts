import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'classic' | 'dark' | 'neon' | 'ocean' | 'sunset' | 'forest';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  headerBg: string;
  isDark: boolean;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  classic: {
    primary: '#4dabf7',
    secondary: '#339af0',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#868e96',
    headerBg: '#0f172a',
    isDark: false,
  },
  dark: {
    primary: '#339af0',
    secondary: '#228be6',
    background: '#1a1a2e',
    card: '#252542',
    text: '#ffffff',
    textMuted: '#a0a0a0',
    headerBg: '#0f172a',
    isDark: true,
  },
  neon: {
    primary: '#00f2ff',
    secondary: '#7000ff',
    background: '#0a0a0f',
    card: '#151520',
    text: '#ffffff',
    textMuted: '#8a8a9a',
    headerBg: '#000000',
    isDark: true,
  },
  ocean: {
    primary: '#00d2ff',
    secondary: '#3a7bd5',
    background: '#f0f4f8',
    card: '#ffffff',
    text: '#1e3a5f',
    textMuted: '#64748b',
    headerBg: '#1e3a5f',
    isDark: false,
  },
  sunset: {
    primary: '#ff8c00',
    secondary: '#ff4e50',
    background: '#fff5f0',
    card: '#ffffff',
    text: '#4a2c2a',
    textMuted: '#a08684',
    headerBg: '#4a2c2a',
    isDark: false,
  },
  forest: {
    primary: '#2ecc71',
    secondary: '#27ae60',
    background: '#f1f8f4',
    card: '#ffffff',
    text: '#1b3022',
    textMuted: '#6b8e7b',
    headerBg: '#1b3022',
    isDark: false,
  },
};

export interface Redemption {
  id: string;
  dripsAmount: number;
  usdAmount: number;
  xrpAmount: number;
  xrpPrice: number;
  walletAddress: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  transactionId?: string;
}

export interface PrivacyConsent {
  region: 'EU' | 'US' | 'OTHER' | null;
  hasCompletedPrivacySetup: boolean;
  euConsent: boolean | null;
  euDataPreferences: {
    personalizedAds: boolean;
    contentMeasurement: boolean;
    audienceResearch: boolean;
    deviceStorage: boolean;
  } | null;
  euVendorConsents: {
    admob: boolean;
    cpx: boolean;
    unityAds: boolean;
  } | null;
  usAllowDataSharing: boolean | null;
  consentTimestamp: number | null;
}

type UserLevel = 'Bronze' | 'Silver' | 'Gold';

const getUserLevel = (totalEarned: number): UserLevel => {
  if (totalEarned >= 20000) return 'Gold';
  if (totalEarned >= 10000) return 'Silver';
  return 'Bronze';
};

interface AppState {
  points: number;
  dailyEarnings: number;
  lastEarningsReset: number;
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  username: string | null;
  uniqueId: string | null;
  theme: ThemeMode;
  unlockedThemes: ThemeMode[];
  walletAddress: string | null;
  redemptions: Redemption[];
  badges: string[];
  totalEarned: number;
  userLevel: UserLevel;
  privacyConsent: PrivacyConsent;
  
  addPoints: (amount: number) => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  setUsername: (name: string) => void;
  setTheme: (theme: ThemeMode) => void;
  unlockTheme: (theme: ThemeMode) => boolean;
  checkDailyReset: () => void;
  setWalletAddress: (address: string) => void;
  createRedemption: (drips: number, usd: number, xrp: number, price: number, wallet: string) => Redemption;
  updateRedemptionStatus: (id: string, status: Redemption['status'], txId?: string) => void;
  addBadge: (badgeId: string) => void;
  claimBadgeReward: (badgeId: string) => number;
  recordShare: (platform: string) => { success: boolean; message: string };
  getDailyShareCount: (platform: string) => number;
  
  setPrivacyRegion: (region: 'EU' | 'US' | 'OTHER') => void;
  setEUConsent: (consent: boolean) => void;
  setEUDataPreferences: (prefs: PrivacyConsent['euDataPreferences']) => void;
  setEUVendorConsents: (consents: PrivacyConsent['euVendorConsents']) => void;
  setUSDataSharing: (allow: boolean) => void;
  completePrivacySetup: () => void;
  revokePrivacyConsent: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      points: 0,
      dailyEarnings: 0,
      lastEarningsReset: Date.now(),
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      username: null,
      uniqueId: null,
      theme: 'classic',
      unlockedThemes: ['classic'],
      walletAddress: null,
      redemptions: [],
      badges: [],
      totalEarned: 0,
      get userLevel() {
        return getUserLevel(get().totalEarned);
      },
      privacyConsent: {
        region: null,
        hasCompletedPrivacySetup: false,
        euConsent: null,
        euDataPreferences: null,
        euVendorConsents: null,
        usAllowDataSharing: null,
        consentTimestamp: null,
      },

      addPoints: (amount) => {
        const state = get();
        state.checkDailyReset();
        const currentDaily = get().dailyEarnings;
        const DAILY_CAP = 5000;
        
        const possibleAdd = Math.min(amount, DAILY_CAP - currentDaily);
        if (possibleAdd <= 0) return;

        set((state) => ({
          points: state.points + possibleAdd,
          dailyEarnings: state.dailyEarnings + possibleAdd,
          totalEarned: state.totalEarned + possibleAdd,
        }));
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      
      setUsername: (name) => {
        if (!get().uniqueId) {
          const newId = Math.floor(100000 + Math.random() * 900000).toString();
          set({ username: name, uniqueId: newId });
        } else {
          set({ username: name });
        }
      },
      
      setTheme: (theme) => set({ theme }),
      
      unlockTheme: (targetTheme) => {
        const state = get();
        if (state.unlockedThemes.includes(targetTheme)) return true;
        if (state.points >= 1000) {
          set((state) => ({
            points: state.points - 1000,
            unlockedThemes: [...state.unlockedThemes, targetTheme],
          }));
          return true;
        }
        return false;
      },

      checkDailyReset: () => {
        const now = new Date();
        const lastReset = new Date(get().lastEarningsReset);
        
        if (
          now.getDate() !== lastReset.getDate() ||
          now.getMonth() !== lastReset.getMonth() ||
          now.getFullYear() !== lastReset.getFullYear()
        ) {
          set({ dailyEarnings: 0, lastEarningsReset: Date.now() });
        }
      },

      setWalletAddress: (address) => set({ walletAddress: address }),

      createRedemption: (drips, usd, xrp, price, wallet) => {
        const newRedemption: Redemption = {
          id: Math.random().toString(36).substring(2, 9),
          dripsAmount: drips,
          usdAmount: usd,
          xrpAmount: xrp,
          xrpPrice: price,
          walletAddress: wallet,
          status: 'pending',
          timestamp: Date.now(),
        };
        set((state) => ({
          points: state.points - drips,
          redemptions: [newRedemption, ...state.redemptions],
        }));
        return newRedemption;
      },

      updateRedemptionStatus: (id, status, txId) => {
        set((state) => ({
          redemptions: state.redemptions.map((r) =>
            r.id === id ? { ...r, status, transactionId: txId } : r
          ),
        }));
      },

      addBadge: (badgeId) => {
        if (!get().badges.includes(badgeId)) {
          set((state) => ({ badges: [...state.badges, badgeId] }));
        }
      },

      claimBadgeReward: (badgeId) => {
        const rewards: Record<string, number> = {
          first_video: 50,
          bronze_member: 250,
          silver_member: 500,
          gold_member: 1000,
          first_cashout: 500,
          referrer: 250,
          week_warrior: 350,
          monthly_master: 1500,
        };
        const reward = rewards[badgeId] || 0;
        if (reward > 0) {
          set((state) => ({ points: state.points + reward }));
        }
        return reward;
      },

      recordShare: (platform) => {
        return { success: true, message: "Shared successfully!" };
      },

      getDailyShareCount: (platform) => 0,

      setPrivacyRegion: (region) => set((state) => ({
        privacyConsent: { ...state.privacyConsent, region }
      })),

      setEUConsent: (consent) => set((state) => ({
        privacyConsent: { 
          ...state.privacyConsent, 
          euConsent: consent,
          consentTimestamp: Date.now()
        }
      })),

      setEUDataPreferences: (prefs) => set((state) => ({
        privacyConsent: { 
          ...state.privacyConsent, 
          euDataPreferences: prefs,
          consentTimestamp: Date.now()
        }
      })),

      setEUVendorConsents: (consents) => set((state) => ({
        privacyConsent: { 
          ...state.privacyConsent, 
          euVendorConsents: consents,
          consentTimestamp: Date.now()
        }
      })),

      setUSDataSharing: (allow) => set((state) => ({
        privacyConsent: { 
          ...state.privacyConsent, 
          usAllowDataSharing: allow,
          consentTimestamp: Date.now()
        }
      })),

      completePrivacySetup: () => set((state) => ({
        privacyConsent: { ...state.privacyConsent, hasCompletedPrivacySetup: true }
      })),

      revokePrivacyConsent: () => set((state) => ({
        privacyConsent: {
          region: state.privacyConsent.region,
          hasCompletedPrivacySetup: false,
          euConsent: null,
          euDataPreferences: null,
          euVendorConsents: null,
          usAllowDataSharing: null,
          consentTimestamp: null,
        },
      })),
    }),
    {
      name: 'dripn-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
