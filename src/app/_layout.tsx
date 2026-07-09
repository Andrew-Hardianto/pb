import 'react-native-get-random-values';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GlobalPopup from '@/components/organisms/GlobalPopup';
import Loader from '@/components/atoms/loader';
import { useAppStore } from '@/stores/appStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'sans-regular': require('@/assets/fonts/DMSans-Regular.ttf'),
    'sans-bold': require('@/assets/fonts/DMSans-Bold.ttf'),
    'sans-medium': require('@/assets/fonts/DMSans-Medium.ttf'),
    'sans-extrabold': require('@/assets/fonts/DMSans-ExtraBold.ttf'),
  });

  const { loading, loadingMessage } = useAppStore();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }

  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <GlobalPopup />
          <Loader visible={loading} message={loadingMessage || null} />
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
