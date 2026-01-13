import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  referralCode: string | null;
  referralCount: number;
  enteredReferralCode: string | null;
  referralBonusEarned: number;
  setPoints: (points: number) => void;
  addPoints: (amount: number) => void;
  setWallet: (address: string | null) => void;
  resetDaily: () => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  addBadge: (badge: string) => void;
  setReferralCode: (code: string) => void;
  enterReferralCode: (code: string) => boolean;
}

const generateReferralCode = () => {
  return 'ADFI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
      referralCode: null,
      referralCount: 0,
      enteredReferralCode: null,
      referralBonusEarned: 0,
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
      resetDaily: () => set({ dailyEarnings: 0, lastEarningsDate: new Date().toDateString() }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      addBadge: (badge) => set((state) => ({ 
        badges: state.badges.includes(badge) ? state.badges : [...state.badges, badge] 
      })),
      setReferralCode: (code) => set({ referralCode: code }),
      enterReferralCode: (code) => {
        const state = get();
        if (state.enteredReferralCode) {
          return false;
        }
        if (code === state.referralCode) {
          return false;
        }
        if (!code.startsWith('ADFI-') || code.length < 10) {
          return false;
        }
        set({ enteredReferralCode: code });
        return true;
      },
    }),
    {
      name: 'crypto-pulse-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.referralCode) {
          state.setReferralCode(generateReferralCode());
        }
      }
    }
  )
);
