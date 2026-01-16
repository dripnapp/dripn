import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BadgeReward {
  id: string;
  reward: number;
  claimed: boolean;
}

type ThemeMode = 'classic' | 'dark';

interface ShareRecord {
  date: string;
  platform: string;
  timestamp: number;
}

interface HistoryRecord {
  id: string;
  type: 'reward' | 'cashout';
  amount: number;
  source: string;
  timestamp: number;
  date: string;
}

interface AppState {
  points: number;
  totalEarned: number;
  walletAddress: string | null;
  isWalletConnected: boolean;
  dailyEarnings: number;
  lastEarningsDate: string | null;
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  userLevel: string;
  badges: string[];
  badgeRewards: BadgeReward[];
  referralCode: string | null;
  referralCount: number;
  enteredReferralCode: string | null;
  referralBonusEarned: number;
  username: string | null;
  xummPayloadId: string | null;
  theme: ThemeMode;
  dailyShares: ShareRecord[];
  history: HistoryRecord[];
  setPoints: (points: number) => void;
  addPoints: (amount: number, source?: string) => void;
  setWallet: (address: string | null) => void;
  disconnectWallet: () => void;
  resetDaily: () => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  addBadge: (badge: string) => void;
  claimBadgeReward: (badgeId: string) => number;
  setReferralCode: (code: string) => void;
  enterReferralCode: (code: string) => boolean;
  setUsername: (username: string) => void;
  setXummPayloadId: (payloadId: string | null) => void;
  setTheme: (theme: ThemeMode) => void;
  recordShare: (platform: string) => { success: boolean; reward: number; message: string };
  getDailyShareCount: () => number;
  recordCashout: (amount: number) => void;
}

const generateReferralCode = () => {
  return 'DRPN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const BADGE_REWARDS: Record<string, number> = {
  first_video: 5,
  bronze: 25,
  silver: 50,
  gold: 100,
  first_cashout: 50,
  referrer: 25,
  streak_7: 35,
  streak_30: 150,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      points: 0,
      totalEarned: 0,
      walletAddress: null,
      isWalletConnected: false,
      dailyEarnings: 0,
      lastEarningsDate: null,
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      userLevel: 'Bronze',
      badges: [],
      badgeRewards: [],
      referralCode: null,
      referralCount: 0,
      enteredReferralCode: null,
      referralBonusEarned: 0,
      username: null,
      xummPayloadId: null,
      theme: 'classic',
      dailyShares: [],
      history: [],
      setPoints: (points) => set({ points }),
      addPoints: (amount, source = 'Task') => set((state) => {
        const today = new Date().toDateString();
        const dailyEarnings = state.lastEarningsDate === today ? state.dailyEarnings + amount : amount;
        const newPoints = state.points + amount;
        const newTotalEarned = (state.totalEarned || 0) + amount;
        let userLevel = state.userLevel;
        if (newTotalEarned >= 1000) userLevel = 'Gold';
        else if (newTotalEarned >= 500) userLevel = 'Silver';
        else if (newTotalEarned >= 100) userLevel = 'Bronze';
        
        const historyRecord: HistoryRecord = {
          id: Date.now().toString(),
          type: 'reward',
          amount,
          source,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
        };
        
        return { 
          points: newPoints,
          totalEarned: newTotalEarned,
          dailyEarnings,
          lastEarningsDate: today,
          userLevel,
          history: [historyRecord, ...state.history].slice(0, 100),
        };
      }),
      setWallet: (address) => set({ 
        walletAddress: address, 
        isWalletConnected: !!address 
      }),
      disconnectWallet: () => set({
        walletAddress: null,
        isWalletConnected: false
      }),
      resetDaily: () => set({ dailyEarnings: 0, lastEarningsDate: new Date().toDateString() }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      addBadge: (badge) => set((state) => {
        if (state.badges.includes(badge)) return state;
        const reward = BADGE_REWARDS[badge] || 0;
        const newBadgeReward: BadgeReward = { id: badge, reward, claimed: false };
        return { 
          badges: [...state.badges, badge],
          badgeRewards: [...state.badgeRewards, newBadgeReward]
        };
      }),
      claimBadgeReward: (badgeId) => {
        const state = get();
        const badgeReward = state.badgeRewards.find(br => br.id === badgeId && !br.claimed);
        if (!badgeReward) return 0;
        
        const newPoints = state.points + badgeReward.reward;
        const newTotalEarned = (state.totalEarned || 0) + badgeReward.reward;
        let userLevel = state.userLevel;
        if (newTotalEarned >= 1000) userLevel = 'Gold';
        else if (newTotalEarned >= 500) userLevel = 'Silver';
        else if (newTotalEarned >= 100) userLevel = 'Bronze';
        
        const historyRecord: HistoryRecord = {
          id: Date.now().toString(),
          type: 'reward',
          amount: badgeReward.reward,
          source: `Badge: ${badgeId}`,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
        };
        
        set({
          points: newPoints,
          totalEarned: newTotalEarned,
          userLevel,
          badgeRewards: state.badgeRewards.map(br => 
            br.id === badgeId ? { ...br, claimed: true } : br
          ),
          history: [historyRecord, ...state.history].slice(0, 100),
        });
        return badgeReward.reward;
      },
      setReferralCode: (code) => set({ referralCode: code }),
      enterReferralCode: (code) => {
        const state = get();
        if (state.enteredReferralCode) {
          return false;
        }
        if (code === state.referralCode) {
          return false;
        }
        if (!code.startsWith('DRPN-') || code.length < 10) {
          return false;
        }
        set({ enteredReferralCode: code });
        return true;
      },
      setUsername: (username) => set({ username }),
      setXummPayloadId: (payloadId) => set({ xummPayloadId: payloadId }),
      setTheme: (theme) => set({ theme }),
      getDailyShareCount: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.dailyShares.filter(s => s.date === today).length;
      },
      recordShare: (platform: string) => {
        const state = get();
        const today = new Date().toDateString();
        const todayShares = state.dailyShares.filter(s => s.date === today);
        
        if (todayShares.length >= 3) {
          return { success: false, reward: 0, message: 'You have reached the maximum 3 shares for today.' };
        }
        
        const lastShare = todayShares[todayShares.length - 1];
        if (lastShare && Date.now() - lastShare.timestamp < 60000) {
          return { success: false, reward: 0, message: 'Please wait at least 1 minute between shares.' };
        }
        
        const shareNumber = todayShares.length + 1;
        let reward = 0;
        if (shareNumber === 1) reward = 1;
        else if (shareNumber === 2) reward = 1;
        else if (shareNumber === 3) reward = 3;
        
        const newShare: ShareRecord = { date: today, platform, timestamp: Date.now() };
        const newPoints = state.points + reward;
        const newTotalEarned = (state.totalEarned || 0) + reward;
        let userLevel = state.userLevel;
        if (newTotalEarned >= 1000) userLevel = 'Gold';
        else if (newTotalEarned >= 500) userLevel = 'Silver';
        else if (newTotalEarned >= 100) userLevel = 'Bronze';
        
        const historyRecord: HistoryRecord = {
          id: Date.now().toString(),
          type: 'reward',
          amount: reward,
          source: `Share: ${platform}`,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
        };
        
        const filteredShares = state.dailyShares.filter(s => s.date === today);
        
        set({ 
          dailyShares: [...filteredShares, newShare],
          points: newPoints,
          totalEarned: newTotalEarned,
          userLevel,
          history: [historyRecord, ...state.history].slice(0, 100),
        });
        
        return { success: true, reward, message: `Share successful! You earned ${reward} drips.` };
      },
      recordCashout: (amount: number) => set((state) => {
        const historyRecord: HistoryRecord = {
          id: Date.now().toString(),
          type: 'cashout',
          amount,
          source: 'XRP Cashout',
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
        };
        return {
          points: state.points - amount,
          history: [historyRecord, ...state.history].slice(0, 100),
        };
      }),
    }),
    {
      name: 'dripn-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.referralCode) {
          state.setReferralCode(generateReferralCode());
        }
      }
    }
  )
);

export { BADGE_REWARDS };
