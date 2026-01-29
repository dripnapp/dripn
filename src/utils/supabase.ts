import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import { Alert } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fxbyabofsejlhtbboynn.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YnlhYm9mc2VqbGh0YmJveW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTgxOTksImV4cCI6MjA4NDg3NDE5OX0.HRSp-stvUFVBCTdD5mSz71v2K5Ee1WcuT6XbKmyfMUk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Server-side secure point award (called instead of direct addPoints for rewards)
export const addPointsServer = async (amount: number, source: string) => {
  const { addPoints } = useStore.getState();

  // Optimistic local update (UI feels instant)
  addPoints(amount);

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.warn('No valid session - reward added locally only', sessionError);
      Alert.alert("Offline Mode", "Reward added locally. Will sync when online.");
      return { success: true, synced: false };
    }

    const response = await fetch('https://fxbyabofsejlhtbboynn.supabase.co/functions/v1/verify-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ amount, source }),
    });

    if (!response.ok) {
      throw new Error(`Server responded ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('Server reward confirmed:', result.new_points);
      // Optional: force re-sync local state if server returned different value
      // But usually not needed unless there's drift
      return { success: true, synced: true };
    } else {
      console.error('Server rejected reward:', result.error);
      Alert.alert("Reward Issue", "Server could not verify. Reward kept locally.");
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('addPointsServer failed:', error);
    Alert.alert("Connection Issue", "Reward added locally. Will try server sync later.");
    return { success: false, error };
  }
};