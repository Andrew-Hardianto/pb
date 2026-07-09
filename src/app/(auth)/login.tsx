import { STORAGE_KEYS } from '@/constants/data';
import { checkBiometricAvailability, verifyBiometric } from '@/services/biometric.service';
import { decrypt, encrypt } from '@/services/crypto.service';
import { getUrlApi, postUrlApi } from '@/services/http.service';
import { dismissLoading, presentLoading } from '@/services/main-service.service';
import { getSecure, setSecure } from '@/services/storage.service';
import { showPopup } from '@/stores/popupStore';
import { handleHttpError } from '@/utils/httpError';
import { isIOS } from '@/utils/platform';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [guideBookUrl, setGuideBookUrl] = useState<string | null>(null);
    const [showBiometricButton, setShowBiometricButton] = useState(false);

    const isFormValid = email.trim() !== '' && password.trim() !== '';

    useEffect(() => {
        const checkBiometricSetup = async () => {
            const isAvailable = await checkBiometricAvailability();
            if (isAvailable) {
                const isSetup = await getSecure(STORAGE_KEYS.IS_SETUP_BIOMETRIC);
                if (isSetup === "true") {
                    setShowBiometricButton(true);
                }
            }
        };
        checkBiometricSetup();
    }, []);

    useEffect(() => {
        const fetchGuideBook = async () => {
            try {
                const result = await getUrlApi('/api/public/v1/lookup/global-files-by-name?name=Buku%20Panduan', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const fileUrl = result?.data?.file || result?.data?.url || result?.url || result?.fileUrl || result?.data?.value;

                if (fileUrl) {
                    setGuideBookUrl(fileUrl);
                }
            } catch (error) {
                handleHttpError(error);
            }
        };

        fetchGuideBook();
    }, []);

    const handleDownloadGuideBook = async () => {
        if (guideBookUrl) {
            try {
                await Linking.openURL(guideBookUrl);
            } catch (error) {
            }
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const isSuccess = await verifyBiometric("Verifikasi sidik jari atau wajah Anda");
            if (!isSuccess) return; // User batal atau verifikasi gagal

            const savedData = await getSecure(STORAGE_KEYS.FINGERPRINT_LOGIN_DATA);
            if (!savedData) {
                showPopup({
                    type: 'error',
                    title: 'Informasi',
                    message: 'Harap login secara manual terlebih dahulu menggunakan email dan password Anda.',
                    primaryButtonText: 'Tutup'
                });
                return;
            }

            const decryptedJson = decrypt(savedData);
            if (!decryptedJson) return;

            const parsedPw = JSON.parse(decryptedJson);
            const userEmail = decrypt(parsedPw.user);
            const userPassword = decrypt(parsedPw.password);

            if (!userEmail || !userPassword) return;

            await presentLoading('Sign In');

            const loginForm = {
                type: "MOBILE",
                email: userEmail,
                password: userPassword
            };

            const res = await postUrlApi('/api/public/v1/auth/login', loginForm, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res && res.access_token) {
                const decodedToken: any = jwtDecode(res.access_token);
                const tenantId = decodedToken.tenant_id;

                await setSecure(STORAGE_KEYS.TENANT_ID, encrypt(tenantId));
                await setSecure(STORAGE_KEYS.ACCESS_TOKEN, encrypt(res.access_token));
                await setSecure(STORAGE_KEYS.REFRESH_TOKEN, encrypt(res.refresh_token));

                await dismissLoading();

                if (res.must_change_password) {
                    router.push({
                        pathname: "/profile/change-password" as any,
                        params: {
                            isChangePassword: "false",
                            isForceChangePassword: "true",
                        }
                    });
                } else {
                    router.replace("/home");
                }
            } else {
                await dismissLoading();
            }
        } catch (error) {
            handleHttpError(error);
        }
    };

    const handleLogin = async () => {
        try {
            await presentLoading('Sign In');

            const loginForm = {
                type: "MOBILE",
                email: email,
                password: password
            };

            const res = await postUrlApi('/api/public/v1/auth/login', loginForm, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res && res.access_token) {
                const decodedToken: any = jwtDecode(res.access_token);
                const tenantId = decodedToken.tenant_id;

                const pw = {
                    user: encrypt(email),
                    password: encrypt(password)
                };

                await setSecure(STORAGE_KEYS.TENANT_ID, encrypt(tenantId));
                await setSecure(STORAGE_KEYS.ACCESS_TOKEN, encrypt(res.access_token));
                await setSecure(STORAGE_KEYS.REFRESH_TOKEN, encrypt(res.refresh_token));
                await setSecure(STORAGE_KEYS.FINGERPRINT_LOGIN_DATA, encrypt(JSON.stringify(pw)));

                await dismissLoading();

                if (res.must_change_password) {
                    router.push({
                        pathname: "/profile/change-password" as any,
                        params: {
                            isChangePassword: "false",
                            isForceChangePassword: "true",
                        }
                    });
                } else {
                    router.replace("/home");
                }
            } else {
                await dismissLoading();
            }
        } catch (error) {
            console.log(error);

            handleHttpError(error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Selamat Datang!</Text>
                            <Text style={styles.subtitle}>Silahkan masuk dan melanjutkan aktivitas</Text>
                        </View>
                        <Image
                            source={require('@/assets/pacificbike.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Email<Text style={styles.asterisk}>*</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="mail" size={20} color="#111" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan email anda"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Kata Sandi<Text style={styles.asterisk}>*</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color="#111" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan kata sandi"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!passwordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Feather
                                        name={passwordVisible ? "eye" : "eye-off"}
                                        size={20}
                                        color="#111"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPassword}>Lupa Password ?</Text>
                        </TouchableOpacity>

                        {/* Buttons Row */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    !showBiometricButton && { marginRight: 0 },
                                    !isFormValid && { backgroundColor: '#CCCCCC' }
                                ]}
                                onPress={handleLogin}
                                disabled={!isFormValid}
                            >
                                <Text style={styles.loginButtonText}>Masuk</Text>
                            </TouchableOpacity>
                            {showBiometricButton && (
                                <TouchableOpacity style={styles.fingerprintButton} onPress={handleBiometricLogin}>
                                    <MaterialCommunityIcons name={isIOS() ? "face-recognition" : "fingerprint"} size={24} color="#E62129" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <TouchableOpacity>
                                <Text style={styles.registerText}>Daftar Pengguna</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.spacer} />

                    {/* Footer Banner */}
                    {guideBookUrl ? (
                        <View style={styles.footerBanner}>
                            <View style={styles.bannerIconContainer}>
                                <Feather name="file-text" size={20} color="#E62129" />
                            </View>
                            <Text style={styles.bannerText}>
                                Unduh buku panduan untuk mempelajari cara menggunakan aplikasi sebelum memulai.
                            </Text>
                            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadGuideBook}>
                                <Text style={styles.downloadButtonText}>Unduh</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        fontFamily: 'sans-bold',
        fontSize: 24,
        color: '#111',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    logo: {
        width: 80,
        height: 60,
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#111',
        marginBottom: 8,
    },
    asterisk: {
        color: '#E62129',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        height: 52,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#111',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    forgotPassword: {
        fontFamily: 'sans-medium',
        fontSize: 13,
        color: '#E62129',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    loginButton: {
        flex: 1,
        backgroundColor: '#E62129',
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    loginButtonText: {
        fontFamily: 'sans-bold',
        fontSize: 15,
        color: '#FFFFFF',
    },
    fingerprintButton: {
        width: 52,
        height: 52,
        backgroundColor: '#FDEBEC',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#EAEAEA',
    },
    dividerText: {
        fontFamily: 'sans-regular',
        fontSize: 13,
        color: '#999',
        paddingHorizontal: 16,
    },
    registerContainer: {
        alignItems: 'center',
    },
    registerText: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#E62129',
        textDecorationLine: 'underline',
        textDecorationColor: '#007BFF', // Based on the user image blue underline
    },
    spacer: {
        flex: 1,
    },
    footerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E5212E',
        borderRadius: 12,
        padding: 12,
    },
    bannerIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FDEBEC',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bannerText: {
        flex: 1,
        fontFamily: 'sans-regular',
        fontSize: 12,
        color: '#444',
        marginRight: 12,
        lineHeight: 18,
    },
    downloadButton: {
        backgroundColor: '#E62129',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    downloadButtonText: {
        fontFamily: 'sans-bold',
        fontSize: 13,
        color: '#FFFFFF',
    },
});