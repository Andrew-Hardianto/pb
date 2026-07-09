import { Platform } from 'react-native';

/**
 * Mengecek apakah perangkat saat ini adalah iOS
 * @returns boolean
 */
export const isIOS = (): boolean => {
    return Platform.OS === 'ios';
};

/**
 * Mengecek apakah perangkat saat ini adalah Android
 * @returns boolean
 */
export const isAndroid = (): boolean => {
    return Platform.OS === 'android';
};
