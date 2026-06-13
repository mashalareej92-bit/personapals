import { Stack } from 'expo-router';
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { ProfileProvider } from './constants/profileStore';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ProfileProvider>
        {!fontsLoaded ? (
          <View style={{ flex: 1, backgroundColor: '#2A2046' }} />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#2A2046' },
              animation: 'fade',
            }}
          />
        )}
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
