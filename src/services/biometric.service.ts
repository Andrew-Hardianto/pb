import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Memeriksa apakah perangkat memiliki hardware biometrik dan sudah mendaftarkan biometrik.
 * @returns boolean - True jika biometrik tersedia dan sudah didaftarkan
 */
export const checkBiometricAvailability = async (): Promise<boolean> => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) return false;

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) return false;

        return true;
    } catch (error) {
        console.error("Biometric Check Error:", error);
        return false;
    }
};

/**
 * Melakukan verifikasi biometrik.
 * @param promptMessage Pesan yang ditampilkan pada modal autentikasi
 * @returns boolean - True jika autentikasi berhasil
 */
export const verifyBiometric = async (
    promptMessage: string = 'Verifikasi sidik jari atau wajah Anda'
): Promise<boolean> => {
    try {
        const isAvailable = await checkBiometricAvailability();
        if (!isAvailable) return false;

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: promptMessage,
            fallbackLabel: 'Gunakan Kata Sandi',
            cancelLabel: 'Batal',
            disableDeviceFallback: false,
        });

        return result.success;
    } catch (error) {
        console.error("Biometric Auth Error:", error);
        return false;
    }
};
