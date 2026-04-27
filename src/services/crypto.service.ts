import CryptoJS from 'crypto-js';
import { environment } from '../config/environment';

export function encrypt(plainText: string): string {
    return CryptoJS.AES.encrypt(
        plainText,
        environment.secureKey.trim()
    ).toString();
}

export function decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(
            encryptedText,
            environment.secureKey.trim()
        );
        return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
        return null;
    }
}