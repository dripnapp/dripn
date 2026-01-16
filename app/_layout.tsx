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
        <Stack.Screen name="index" options={{ title: "Drip'n", headerShown: false }} />
        <Stack.Screen name="history" options={{ title: 'History', headerShown: false }} />
        <Stack.Screen name="learn" options={{ title: 'Learn Crypto', headerShown: false }} />
        <Stack.Screen name="legal" options={{ title: 'Legal', headerShown: false }} />
        <Stack.Screen name="terms" options={{ title: 'Terms of Use', headerShown: false }} />
        <Stack.Screen name="referral" options={{ title: 'Referral Program', headerShown: false }} />
        <Stack.Screen name="badges" options={{ title: 'Your Badges', headerShown: false }} />
        <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard', headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
        <Stack.Screen name="contact" options={{ title: 'Contact', headerShown: false }} />
      </Stack>
    </>
  );
}
