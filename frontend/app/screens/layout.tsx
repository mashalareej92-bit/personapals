import { Stack } from 'expo-router';
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6C4AB6' }}>
        <ActivityIndicator size="large" color="#FFD166" />
      </View>
    );
  }

  return (
    // initialWindowMetrics fixes the Android "white flash at bottom" on first render.
    // Without it, SafeAreaProvider doesn't know the insets until after the first paint,
    // causing a flicker of wrong padding. initialWindowMetrics pre-loads them synchronously.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Stack
        screenOptions={{
          headerShown: false,
          // Makes the area behind the Android nav bar match the app's cream background
          contentStyle: { backgroundColor: '#F6F0E5' },
        }}
      />
    </SafeAreaProvider>
  );
}
