import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../utils/supabase';

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

export const BADGE_REWARDS: Record<string, number> = {
  first_video: 50,
  bronze_member: 250,
  silver_member: 500,
  gold_member: 1000,
  first_cashout: 500,
  referrer: 250,
  week_warrior: 350,
  monthly_master: 1500,
};

type UserLevel = 'None' | 'Bronze' | 'Silver' | 'Gold';

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
  userLevel: 'None' | 'Bronze' | 'Silver' | 'Gold';
  privacyConsent: PrivacyConsent;
  
  addPoints: (amount: number, source?: string) => Promise<void>;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  setUsername: (name: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  unlockTheme: (theme: ThemeMode) => boolean;
  checkDailyReset: () => void;
  setWalletAddress: (address: string) => void;
  createRedemption: (drips: number, usd: number, xrp: number, price: number, wallet: string) => Promise<Redemption>;
  updateRedemptionStatus: (id: string, status: Redemption['status'], txId?: string) => Promise<void>;
  addBadge: (badgeId: string) => Promise<void>;
  claimBadgeReward: (badgeId: string) => number;
  recordShare: (platform: string) => Promise<{ success: boolean; message: string }>;
  getDailyShareCount: (platform: string) => number;
  
  setPrivacyRegion: (region: 'EU' | 'US' | 'OTHER') => Promise<void>;
  setEUConsent: (consent: boolean) => Promise<void>;
  setEUDataPreferences: (prefs: PrivacyConsent['euDataPreferences']) => Promise<void>;
  setEUVendorConsents: (consents: PrivacyConsent['euVendorConsents']) => Promise<void>;
  setUSDataSharing: (allow: boolean) => Promise<void>;
  completePrivacySetup: () => Promise<void>;
  revokePrivacyConsent: () => Promise<void>;
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
      userLevel: 'None',
      privacyConsent: {
        region: null,
        hasCompletedPrivacySetup: false,
        euConsent: null,
        euDataPreferences: null,
        euVendorConsents: null,
        usAllowDataSharing: null,
        consentTimestamp: null,
      },

      addPoints: async (amount, source = 'reward') => {
        const state = get();
        state.checkDailyReset();
        const currentDaily = get().dailyEarnings;
        const DAILY_CAP = 5000;
        
        const possibleAdd = Math.min(amount, DAILY_CAP - currentDaily);
        if (possibleAdd <= 0) return;

        const newTotal = state.totalEarned + possibleAdd;
        let newLevel: UserLevel = 'None';
        if (newTotal >= 20000) newLevel = 'Gold';
        else if (newTotal >= 10000) newLevel = 'Silver';
        else if (newTotal >= 5000) newLevel = 'Bronze';
        else newLevel = 'None';

        set({
          points: state.points + possibleAdd,
          dailyEarnings: state.dailyEarnings + possibleAdd,
          totalEarned: newTotal,
          userLevel: newLevel,
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('users').update({
            points: get().points,
            total_earned: newTotal,
            user_level: newLevel
          }).eq('id', session.user.id);

          const dateStr = new Date().toISOString().split('T')[0];
          await supabase.from('daily_earnings').upsert({
            user_id: session.user.id,
            date: dateStr,
            earnings: state.dailyEarnings + possibleAdd
          }, { onConflict: 'user_id,date' });

          await supabase.from('history').insert({
            user_id: session.user.id,
            type: 'reward',
            amount: possibleAdd,
            source: source,
            status: 'completed'
          });
        }
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      
      setUsername: async (name) => {
        const state = get();
        let newId = state.uniqueId;
        if (!newId) {
          newId = Math.floor(100000 + Math.random() * 900000).toString();
        }

        set({ username: name, uniqueId: newId });

        // Sync to Supabase if session exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('users').update({ 
            username: name,
            unique_id: newId
          }).eq('id', session.user.id);
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

      checkDailyReset: async () => {
        const now = new Date();
        const lastReset = new Date(get().lastEarningsReset);
        
        if (
          now.getDate() !== lastReset.getDate() ||
          now.getMonth() !== lastReset.getMonth() ||
          now.getFullYear() !== lastReset.getFullYear()
        ) {
          set({ dailyEarnings: 0, lastEarningsReset: Date.now() });

          // Sync reset state to Supabase if session exists
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const dateStr = now.toISOString().split('T')[0];
            await supabase.from('daily_earnings').upsert({
              user_id: session.user.id,
              date: dateStr,
              earnings: 0
            }, { onConflict: 'user_id,date' });
          }
        }
      },

      setWalletAddress: (address) => set({ walletAddress: address }),

      createRedemption: async (drips, usd, xrp, price, wallet) => {
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

        // Sync to Supabase redemptions table
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: dbRedemption, error } = await supabase.from('redemptions').insert({
            user_id: session.user.id,
            drips_amount: drips,
            usd_amount: usd,
            xrp_amount: xrp,
            xrp_price: price,
            wallet_address: wallet,
            status: 'pending'
          }).select().single();

          if (dbRedemption) {
            // Update local ID to match DB ID if needed, or keep local ID for UI
          }

          // Sync to history table as well
          await supabase.from('history').insert({
            user_id: session.user.id,
            type: 'redemption',
            amount: drips,
            source: 'CoinGate',
            xrp_amount: xrp,
            status: 'pending',
            details: { 
              usd_amount: usd, 
              xrp_price: price, 
              wallet_address: wallet,
              local_id: newRedemption.id 
            }
          });

          // Also update users table points
          await supabase.from('users').update({
            points: get().points
          }).eq('id', session.user.id);
        }

        return newRedemption;
      },

      updateRedemptionStatus: async (id, status, txId) => {
        set((state) => ({
          redemptions: state.redemptions.map((r) =>
            r.id === id ? { ...r, status, transactionId: txId } : r
          ),
        }));

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Update redemptions table (using local ID in details to find it since we didn't store DB ID locally)
          // In a real app we'd store the DB ID, but for now we filter by user and amounts if needed
          // Better: update history which we already handle, and update redemptions table
          
          await supabase.from('redemptions')
            .update({ 
              status: status,
              transaction_id: txId,
              completed_at: status === 'completed' ? new Date().toISOString() : null
            })
            .eq('user_id', session.user.id)
            .eq('status', 'pending'); // Simple heuristic for now

          await supabase.from('history')
            .update({ 
              status: status,
              transaction_id: txId
            })
            .eq('user_id', session.user.id)
            .eq('type', 'redemption')
            .filter('details->>local_id', 'eq', id);
        }
      },

      addBadge: async (badgeId) => {
        if (!get().badges.includes(badgeId)) {
          set((state) => ({ badges: [...state.badges, badgeId] }));
          
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await supabase.from('badges').upsert({
              user_id: session.user.id,
              badge_id: badgeId,
              reward: BADGE_REWARDS[badgeId] || 0,
              claimed: false
            }, { onConflict: 'user_id,badge_id' });
          }
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
        return reward;
      },

      recordShare: async (platform) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            const { error } = await supabase.from('shares').insert({
              user_id: session.user.id,
              platform: platform,
              reward: 100
            });

            if (error) {
              if (error.code === '23505') { // Unique constraint violation
                return { success: false, message: `You have already shared on ${platform} today!` };
              }
              throw error;
            }
            
            // Sync to history table
            await supabase.from('history').insert({
              user_id: session.user.id,
              type: 'reward',
              amount: 100,
              source: `Social Share (${platform})`,
              status: 'completed'
            });

            return { success: true, message: "Shared successfully!" };
          } catch (err) {
            console.error('Error recording share:', err);
            return { success: false, message: "Failed to record share." };
          }
        }
        return { success: true, message: "Shared successfully!" };
      },

      getDailyShareCount: (platform) => 0,

      setPrivacyRegion: async (region) => {
        set((state) => ({
          privacyConsent: { ...state.privacyConsent, region }
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').upsert({
            user_id: session.user.id,
            region: region,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      },

      setEUConsent: async (consent) => {
        const timestamp = Date.now();
        set((state) => ({
          privacyConsent: { 
            ...state.privacyConsent, 
            euConsent: consent,
            consentTimestamp: timestamp
          }
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').upsert({
            user_id: session.user.id,
            eu_consent: consent,
            consent_timestamp: new Date(timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      },

      setEUDataPreferences: async (prefs) => {
        const timestamp = Date.now();
        set((state) => ({
          privacyConsent: { 
            ...state.privacyConsent, 
            euDataPreferences: prefs,
            consentTimestamp: timestamp
          }
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').upsert({
            user_id: session.user.id,
            eu_data_preferences: prefs,
            consent_timestamp: new Date(timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      },

      setEUVendorConsents: async (consents) => {
        const timestamp = Date.now();
        set((state) => ({
          privacyConsent: { 
            ...state.privacyConsent, 
            euVendorConsents: consents,
            consentTimestamp: timestamp
          }
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').upsert({
            user_id: session.user.id,
            eu_vendor_consents: consents,
            consent_timestamp: new Date(timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      },

      setUSDataSharing: async (allow) => {
        const timestamp = Date.now();
        set((state) => ({
          privacyConsent: { 
            ...state.privacyConsent, 
            usAllowDataSharing: allow,
            consentTimestamp: timestamp
          }
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').upsert({
            user_id: session.user.id,
            us_allow_data_sharing: allow,
            consent_timestamp: new Date(timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      },

      completePrivacySetup: async () => {
        set((state) => ({
          privacyConsent: { ...state.privacyConsent, hasCompletedPrivacySetup: true }
        }));
        // Optional: you could mark a flag in users table if needed, 
        // but privacy_consent table existence usually suffices.
      },

      revokePrivacyConsent: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('privacy_consent').delete().eq('user_id', session.user.id);
        }
        set((state) => ({
          privacyConsent: {
            region: state.privacyConsent.region,
            hasCompletedPrivacySetup: false,
            euConsent: null,
            euDataPreferences: null,
            euVendorConsents: null,
            usAllowDataSharing: null,
            consentTimestamp: null,
          },
        }));
      },
    }),
    {
      name: 'dripn-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
