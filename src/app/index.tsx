import { STORAGE_KEYS } from '@/constants/data';
import { getSecure } from '@/services/storage.service';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getSecure(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token check failed", error);
      } finally {
        setIsChecking(false);
      }
    };
    checkToken();
  }, []);

  if (isChecking) {
    return null;
  }

  if (isLoggedIn) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
