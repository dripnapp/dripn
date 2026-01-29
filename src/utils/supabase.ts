import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { useStore } from '../store/useStore';
import { Alert } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fxbyabofsejlhtbboynn.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YnlhYm9mc2VqbGh0YmJveW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTgxOTksImV4cCI6MjA4NDg3NDE5OX0.HRSp-stvUFVBCTdD5mSz71v2K5Ee1WcuT6XbKmyfMUk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const addPointsServer = async (amount: number, source: string) => {
  const { addPoints } = useStore.getState();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.log('No Supabase session found, falling back to local addPoints');
      addPoints(amount);
      return { success: true, local: true };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ amount, source }),
    });

    const result = await response.json();

    if (result.success) {
      // Sync local state with server response if needed, 
      // but the instructions say call local addPoints with the returned amount
      addPoints(amount); 
      return { success: true, server: true };
    } else {
      console.error('Server reward error:', result.error);
      Alert.alert("Sync Error", "Could not verify reward on server. Adding locally.");
      addPoints(amount);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('addPointsServer error:', error);
    addPoints(amount);
    return { success: false, error };
  }
};
