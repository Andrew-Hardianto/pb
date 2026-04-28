import CryptoJS from 'crypto-js';
import { Env } from '../../env';

export function encrypt(plainText: string): string {
    return CryptoJS.AES.encrypt(
        plainText,
        Env.EXPO_PUBLIC_APP_KEY
    ).toString();
}

export function decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(
            encryptedText,
            Env.EXPO_PUBLIC_APP_KEY
        );
        return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
        return null;
    }
}