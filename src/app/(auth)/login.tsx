import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { STORAGE_KEYS } from '@/constants/data';
import { useTheme } from '@/hooks/useTheme';
import { checkBiometricAvailability, verifyBiometric } from '@/services/biometric.service';
import { decrypt, encrypt } from '@/services/crypto.service';
import { getUrlApi, postUrlApi } from '@/services/http.service';
import { dismissLoading, presentLoading } from '@/services/main-service.service';
import { getSecure, removeSecure, setSecure } from '@/services/storage.service';
import { showPopup } from '@/stores/popupStore';
import { handleHttpError, handleHttpErrorLogin } from '@/utils/httpError';
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
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { colors, isDarkMode } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
        const checkRememberMe = async () => {
            const savedData = await getSecure(STORAGE_KEYS.REMEMBER_ME);
            if (savedData) {
                const decryptedJson = decrypt(savedData);
                if (decryptedJson) {
                    const parsedData = JSON.parse(decryptedJson);
                    const savedEmail = decrypt(parsedData.user);
                    const savedPassword = decrypt(parsedData.password);
                    if (savedEmail && savedPassword) {
                        setEmail(savedEmail);
                        setPassword(savedPassword);
                        setRememberMe(true);
                    }
                }
            }
        };
        checkRememberMe();
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
            handleHttpErrorLogin(error);
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

                if (rememberMe) {
                    await setSecure(STORAGE_KEYS.REMEMBER_ME, encrypt(JSON.stringify(pw)));
                } else {
                    await removeSecure(STORAGE_KEYS.REMEMBER_ME);
                }

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

            handleHttpErrorLogin(error);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>Selamat Datang!</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Silahkan masuk dan melanjutkan aktivitas</Text>
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
                        <Input
                            label="Email"
                            required
                            placeholder="Masukkan email anda"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon={<Feather name="mail" size={20} color={colors.text} />}
                        />

                        {/* Password Input */}
                        <Input
                            label="Kata Sandi"
                            required
                            placeholder="Masukkan kata sandi"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                            leftIcon={<Feather name="lock" size={20} color={colors.text} />}
                            rightIcon={
                                <TouchableOpacity
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Feather
                                        name={passwordVisible ? "eye" : "eye-off"}
                                        size={20}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        {/* Options Row */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
                                <MaterialCommunityIcons
                                    name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={20}
                                    color={rememberMe ? "#E62129" : colors.textSecondary}
                                />
                                <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Ingat Saya</Text>
                            </TouchableOpacity>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPassword}>Lupa Password ?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Buttons Row */}
                        <View style={styles.buttonRow}>
                            <Button
                                title="Masuk"
                                onPress={handleLogin}
                                disabled={!isFormValid}
                                style={[
                                    styles.loginButton,
                                    !showBiometricButton && { marginRight: 0 },
                                ]}
                            />
                            {showBiometricButton && (
                                <TouchableOpacity style={styles.fingerprintButton} onPress={handleBiometricLogin}>
                                    <MaterialCommunityIcons name={isIOS() ? "face-recognition" : "fingerprint"} size={24} color="#E62129" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, isDarkMode && { backgroundColor: colors.backgroundElement }]} />
                            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Atau</Text>
                            <View style={[styles.dividerLine, isDarkMode && { backgroundColor: colors.backgroundElement }]} />
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                                <Text style={styles.registerText}>Daftar Pengguna</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.spacer} />

                    {/* Footer Banner */}
                    {guideBookUrl ? (
                        <View style={[styles.footerBanner, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FAFAFA' }]}>
                            <View style={styles.bannerIconContainer}>
                                <Feather name="file-text" size={20} color="#E62129" />
                            </View>
                            <Text style={[styles.bannerText, { color: colors.text }]}>
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
    eyeIcon: {
        padding: 4,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberMeText: {
        marginLeft: 8,
        fontFamily: 'sans-medium',
        fontSize: 13,
        color: '#444',
    },
    forgotPasswordContainer: {
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
        marginRight: 12,
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
        textDecorationColor: '#E62129',
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