import * as Keychain from 'react-native-keychain';

// Untuk data sensitif (token) → pakai Keychain (encrypted by OS)
export async function setSecure(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(key, value, { service: key });
}

export async function getSecure(key: string): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
}

export async function removeSecure(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
}

export async function removeSecureMultiple(keys: string[]): Promise<void> {
    await Promise.all(
        keys.map((key) => Keychain.resetGenericPassword({ service: key }))
    );
}