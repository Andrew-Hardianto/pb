import { STORAGE_KEYS } from '@/constants/data';
import { encrypt } from '@/services/crypto.service';
import { setSecure } from '@/services/storage.service';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const settings = await Notifications.getPermissionsAsync();
    let isGranted = (settings as any).granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!isGranted) {
      const requestStatus = await Notifications.requestPermissionsAsync();
      isGranted = (requestStatus as any).granted || requestStatus.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    }
    if (!isGranted) {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here; if you don't have one and use bare workflow, you can omit projectId.
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    await setSecure(STORAGE_KEYS.FIREBASE_TOKEN, encrypt(token));
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
