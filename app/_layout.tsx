import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1a1a1a',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen name="index" options={{ title: 'droply', headerShown: true }} />
        <Stack.Screen name="learn" options={{ title: 'Learn Crypto', headerShown: true }} />
        <Stack.Screen name="legal" options={{ title: 'Legal', headerShown: true }} />
        <Stack.Screen name="terms" options={{ title: 'Terms of Use', headerShown: true }} />
        <Stack.Screen name="referral" options={{ title: 'Referral Program', headerShown: true }} />
        <Stack.Screen name="badges" options={{ title: 'Your Badges', headerShown: true }} />
        <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard', headerShown: true }} />
      </Stack>
    </>
  );
}
