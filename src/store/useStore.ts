import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BadgeReward {
  id: string;
  reward: number;
  claimed: boolean;
}

export type ThemeMode = 'classic' | 'dark' | 'neon' | 'ocean' | 'sunset' | 'forest';

interface ShareRecord {
  date: string;
  platform: string;
  timestamp: number;
}

interface HistoryRecord {
  id: string;
  type: 'reward' | 'purchase' | 'redemption';
  amount: number;
  source: string;
  timestamp: number;
  date: string;
  xrpAmount?: number;
  transactionId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface RedemptionRecord {
  id: string;
  dripsAmount: number;
  usdAmount: number;
  xrpAmount: number;
  xrpPrice: number;
  walletAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: number;
  completedAt?: number;
}

interface AppState {
  points: number;
  totalEarned: number;
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
  theme: ThemeMode;
  unlockedThemes: ThemeMode[];
  dailyShares: ShareRecord[];
  history: HistoryRecord[];
  walletAddress: string | null;
  redemptions: RedemptionRecord[];
  setPoints: (points: number) => void;
  addPoints: (amount: number, source?: string) => void;
  deductPoints: (amount: number) => boolean;
  resetDaily: () => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  addBadge: (badge: string) => void;
  claimBadgeReward: (badgeId: string) => number;
  setReferralCode: (code: string) => void;
  enterReferralCode: (code: string) => boolean;
  setUsername: (username: string) => void;
  setTheme: (theme: ThemeMode) => void;
  unlockTheme: (theme: ThemeMode) => boolean;
  recordShare: (platform: string) => { success: boolean; reward: number; message: string };
  getDailyShareCount: () => number;
  checkDailyReset: () => void;
  setWalletAddress: (address: string | null) => void;
  createRedemption: (dripsAmount: number, usdAmount: number, xrpAmount: number, xrpPrice: number, walletAddress: string) => RedemptionRecord;
  updateRedemptionStatus: (id: string, status: RedemptionRecord['status'], transactionId?: string) => void;
}

const generateReferralCode = () => {
  return 'DRPN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const BADGE_REWARDS: Record<string, number> = {
  first_video: 5,
  bronze: 25,
  silver: 50,
  gold: 100,
  referrer: 25,
  streak_7: 35,
  streak_30: 150,
};

const THEME_COST = 1000;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      points: 0,
      totalEarned: 0,
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
      theme: 'classic',
      unlockedThemes: ['classic'],
      dailyShares: [],
      history: [],
      walletAddress: null,
      redemptions: [],
      setPoints: (points) => set({ points }),
      addPoints: (amount, source = 'Task') => set((state) => {
        state.checkDailyReset();
        const updatedState = get();
        const today = new Date().toDateString();
        const dailyEarnings = updatedState.lastEarningsDate === today ? updatedState.dailyEarnings + amount : amount;
        const newPoints = updatedState.points + amount;
        const newTotalEarned = (updatedState.totalEarned || 0) + amount;
        let userLevel = updatedState.userLevel;
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
          history: [historyRecord, ...updatedState.history].slice(0, 100),
        };
      }),
      deductPoints: (amount) => {
        const state = get();
        if (state.points < amount) return false;
        set({ points: state.points - amount });
        return true;
      },
      resetDaily: () => set({ dailyEarnings: 0, lastEarningsDate: new Date().toDateString() }),
      checkDailyReset: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastEarningsDate !== today) {
          set({ dailyEarnings: 0, lastEarningsDate: today });
        }
      },
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
      setTheme: (theme) => set({ theme }),
      unlockTheme: (theme) => {
        const state = get();
        if (state.unlockedThemes.includes(theme)) return true;
        if (state.points < THEME_COST) return false;
        
        const historyRecord: HistoryRecord = {
          id: Date.now().toString(),
          type: 'purchase',
          amount: THEME_COST,
          source: `Unlocked Theme: ${theme}`,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
        };
        
        set({
          points: state.points - THEME_COST,
          unlockedThemes: [...state.unlockedThemes, theme],
          history: [historyRecord, ...state.history].slice(0, 100),
        });
        return true;
      },
      getDailyShareCount: () => {
        const state = get();
        state.checkDailyReset();
        const today = new Date().toDateString();
        return state.dailyShares.filter(s => s.date === today).length;
      },
      recordShare: (platform: string) => {
        const state = get();
        state.checkDailyReset();
        const today = new Date().toDateString();
        const todayPlatformShares = state.dailyShares.filter(s => s.date === today && s.platform === platform);
        
        if (todayPlatformShares.length >= 1) {
          return { success: false, reward: 0, message: `You have already shared on ${platform} today.` };
        }
        
        const reward = 100;
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
      setWalletAddress: (address) => set({ walletAddress: address }),
      createRedemption: (dripsAmount, usdAmount, xrpAmount, xrpPrice, walletAddress) => {
        const state = get();
        const redemption: RedemptionRecord = {
          id: Date.now().toString(),
          dripsAmount,
          usdAmount,
          xrpAmount,
          xrpPrice,
          walletAddress,
          status: 'pending',
          createdAt: Date.now(),
        };
        
        const historyRecord: HistoryRecord = {
          id: redemption.id,
          type: 'redemption',
          amount: dripsAmount,
          source: 'Redemption Request',
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
          xrpAmount,
          status: 'pending',
        };
        
        set({
          points: state.points - dripsAmount,
          redemptions: [redemption, ...state.redemptions],
          history: [historyRecord, ...state.history].slice(0, 100),
        });
        
        return redemption;
      },
      updateRedemptionStatus: (id, status, transactionId) => {
        const state = get();
        set({
          redemptions: state.redemptions.map(r => 
            r.id === id ? { 
              ...r, 
              status, 
              transactionId,
              completedAt: status === 'completed' ? Date.now() : r.completedAt 
            } : r
          ),
          history: state.history.map(h =>
            h.id === id ? { ...h, status, transactionId } : h
          ),
        });
      },
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
