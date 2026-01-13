import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  points: number;
  walletAddress: string | null;
  isWalletConnected: boolean;
  dailyEarnings: number;
  lastEarningsDate: string | null;
  setPoints: (points: number) => void;
  addPoints: (amount: number) => void;
  setWallet: (address: string | null) => void;
  resetDaily: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      points: 0,
      walletAddress: null,
      isWalletConnected: false,
      dailyEarnings: 0,
      lastEarningsDate: null,
      setPoints: (points) => set({ points }),
      addPoints: (amount) => set((state) => {
        const today = new Date().toDateString();
        const dailyEarnings = state.lastEarningsDate === today ? state.dailyEarnings + amount : amount;
        return { 
          points: state.points + amount,
          dailyEarnings,
          lastEarningsDate: today
        };
      }),
      setWallet: (address) => set({ 
        walletAddress: address, 
        isWalletConnected: !!address 
      }),
      resetDaily: () => set({ dailyEarnings: 0, lastEarningsDate: new Date().toDateString() }),
    }),
    {
      name: 'crypto-pulse-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
