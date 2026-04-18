import { useFonts } from "expo-font";
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'sans-extrabold': require('../assets/fonts/DMSans-ExtraBold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
