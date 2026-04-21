import { useFonts } from "expo-font";
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'sans-regular': require('@/assets/fonts/DMSans-Regular.ttf'),
    'sans-bold': require('@/assets/fonts/DMSans-Bold.ttf'),
    'sans-medium': require('@/assets/fonts/DMSans-Medium.ttf'),
    'sans-extrabold': require('@/assets/fonts/DMSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
    console.log(!fontsLoaded && !fontError);

  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
