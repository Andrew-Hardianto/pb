import axios from 'axios';
import { format } from 'date-fns';
import { Linking } from 'react-native';

import { Env } from '../../env';
import { COLORS, STORAGE_KEYS } from '../constants/data';
import { useAppStore } from '../stores/appStore';
import { decrypt } from './crypto.service';
import { navigateRoot } from './navigation.service';
import { getSecure, removeSecureMultiple } from './storage.service';


// ─── Token & Profile Getters ──────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
    const raw = await getSecure(STORAGE_KEYS.ACCESS_TOKEN);
    return decrypt(raw);
}

export async function getRefreshToken(): Promise<string | null> {
    const raw = await getSecure(STORAGE_KEYS.REFRESH_TOKEN);
    return decrypt(raw);
}

export async function getProfile(): Promise<any> {
    const raw = await getSecure(STORAGE_KEYS.PROFILE);
    const decrypted = decrypt(raw);
    return decrypted ? JSON.parse(decrypted) : null;
}

export async function authoritiesToken(): Promise<string> {
    const raw = await getSecure(STORAGE_KEYS.AUTHORITIES_TOKEN);
    return decrypt(raw) ?? '';
}

export async function tenantId(): Promise<string | null> {
    const raw = await getSecure(STORAGE_KEYS.TENANT_ID);
    return decrypt(raw);
}

export async function getInstanceForgotPassword(): Promise<string | null> {
    const raw = await getSecure(STORAGE_KEYS.FORGOT_PASSWORD);
    return decrypt(raw);
}

// ─── Loading (pengganti presentLoading / dismissLoading) ─────────────────────

export async function presentLoading(message?: string): Promise<void> {
    useAppStore.getState().setLoading(true, message);
}

export async function dismissLoading(): Promise<void> {
    useAppStore.getState().setLoading(false, undefined);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getMainUrl(): string {
    return Env.EXPO_PUBLIC_API_URL ?? "";
}

export function getVersion(): string {
    return Env.EXPO_PUBLIC_VERSION ?? "";
}

export function characterCount(length: number, maxlength: number): string {
    return `${maxlength - length} characters remaining`;
}

export function getColorAvatar(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export async function openInAppBrowser(url: string): Promise<void> {
    // npm install react-native-inappbrowser-reborn  ← untuk in-app browser
    // atau gunakan Linking untuk buka browser eksternal
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    }
}

/**
 * convertDate — pengganti Angular formatDate()
 * Format string menggunakan date-fns: https://date-fns.org/docs/format
 * Contoh: 'dd/MM/yyyy', 'yyyy-MM-dd', 'dd MMM yyyy'
 */
export function convertDate(
    value: string | Date | null | undefined,
    formatStr: string
): string | null {
    if (!value) return null;
    try {
        return format(new Date(value), formatStr);
    } catch {
        return null;
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function clearStorageDataOnLogout(): void {
    removeSecureMultiple([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.AUTHORITIES_TOKEN,
        STORAGE_KEYS.PROFILE,
        STORAGE_KEYS.G3BP4J66UD,
        STORAGE_KEYS.PCL75YWWDB,
        STORAGE_KEYS.I9WJ1B85A8,
        STORAGE_KEYS.TENANT_ID,
    ]);
}

export async function logout(): Promise<void> {
    const store = useAppStore.getState();
    store.setLoadingLogout(true);
    await presentLoading('Sign Out');

    const urlApi = `${getMainUrl()}/api/public/v1/auth/logout`;

    try {
        const [accessToken, authToken] = await Promise.all([
            getAccessToken(),
            authoritiesToken(),
        ]);

        await axios.post(urlApi, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                AuthorizationToken: authToken,
            },
            timeout: 60_000,
        });
    } catch {
        // Tetap logout meskipun API gagal — sama dengan behavior asli
    } finally {
        clearStorageDataOnLogout();
        setTimeout(async () => {
            navigateRoot('Login');
            store.setLoadingLogout(false);
            await dismissLoading();
        }, 500);
    }
}