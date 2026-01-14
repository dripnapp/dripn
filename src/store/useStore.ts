import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BadgeReward {
  id: string;
  reward: number;
  claimed: boolean;
}

interface AppState {
  points: number;
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
  setPoints: (points: number) => void;
  addPoints: (amount: number) => void;
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
}

const generateReferralCode = () => {
  return 'DROP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
      setPoints: (points) => set({ points }),
      addPoints: (amount) => set((state) => {
        const today = new Date().toDateString();
        const dailyEarnings = state.lastEarningsDate === today ? state.dailyEarnings + amount : amount;
        const newPoints = state.points + amount;
        let userLevel = state.userLevel;
        if (newPoints >= 1000) userLevel = 'Gold';
        else if (newPoints >= 500) userLevel = 'Silver';
        else if (newPoints >= 100) userLevel = 'Bronze';
        return { 
          points: newPoints,
          dailyEarnings,
          lastEarningsDate: today,
          userLevel
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
        let userLevel = state.userLevel;
        if (newPoints >= 1000) userLevel = 'Gold';
        else if (newPoints >= 500) userLevel = 'Silver';
        else if (newPoints >= 100) userLevel = 'Bronze';
        
        set({
          points: newPoints,
          userLevel,
          badgeRewards: state.badgeRewards.map(br => 
            br.id === badgeId ? { ...br, claimed: true } : br
          )
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
        if (!code.startsWith('DROP-') || code.length < 10) {
          return false;
        }
        set({ enteredReferralCode: code });
        return true;
      },
      setUsername: (username) => set({ username }),
      setXummPayloadId: (payloadId) => set({ xummPayloadId: payloadId }),
    }),
    {
      name: 'droply-storage',
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
