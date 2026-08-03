import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { useAppStore } from '@/stores/appStore';
import { usePopupStore } from '@/stores/popupStore';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import LockIcon from '@/assets/icon/general/lock.svg';

const passwordSchema = z.string()
    .min(8)
    .max(20)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/);

export default function ChangePasswordScreen() {
    const { colors, isDarkMode } = useTheme();
    const router = useRouter();
    const { setLoading } = useAppStore();
    const popup = usePopupStore();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitted, setIsSubmitted] = useState(false);

    const isNewPasswordValid = () => {
        try {
            passwordSchema.parse(newPassword);
            return true;
        } catch (e) {
            return false;
        }
    };

    const isConfirmPasswordValid = () => {
        return newPassword === confirmPassword;
    };

    const getNewPasswordError = () => {
        if (!isSubmitted && !newPassword) return null;
        if (!isNewPasswordValid()) {
            return "Kata sandi Anda harus berisi setidaknya satu huruf kecil, satu huruf besar, satu angka, satu simbol, dan terdiri dari 8-20 karakter";
        }
        return null;
    };

    const getConfirmPasswordError = () => {
        if (!isSubmitted && !confirmPassword) return null;
        if (confirmPassword && !isConfirmPasswordValid()) {
            return "Kata sandi dan konfirmasi kata sandi tidak sama";
        }
        return null;
    };

    const isValid = () => {
        return oldPassword.length > 0 && isNewPasswordValid() && isConfirmPasswordValid();
    };

    const handleSubmit = async () => {
        setIsSubmitted(true);
        if (!isValid()) return;

        setLoading(true, "Mengubah kata sandi...");
        try {
            await axiosInstance.post('/api/mobile/v1/profile/change-password', {
                oldPassword: oldPassword,
                newPassword: newPassword,
                passwordConfirmation: confirmPassword
            });
            setLoading(false);
            popup.show({
                type: 'success',
                title: 'Berhasil',
                message: 'Kata sandi Anda berhasil diubah.',
                primaryButtonText: 'Tutup',
                onPrimaryPress: () => router.back()
            });
        } catch (error: any) {
            setLoading(false);
            popup.show({
                type: 'error',
                title: 'Gagal',
                primaryButtonText: 'Tutup',
                message: error?.response?.data?.message || 'Terjadi kesalahan saat mengubah kata sandi.'
            });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Ubah Kata Sandi</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={{ flex: 1 }} 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                >
                    <Input
                        label="Kata Sandi Lama"
                        required
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!showOldPassword}
                        placeholder="••••••••••••"
                        leftIcon={<LockIcon width={20} height={20} color={colors.textSecondary} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                                <Feather name={showOldPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Kata Sandi Baru"
                        required
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="••••"
                        error={getNewPasswordError()}
                        leftIcon={<LockIcon width={20} height={20} color={colors.textSecondary} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Feather name={showNewPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Konfirmasi Kata Sandi"
                        required
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="•••"
                        error={getConfirmPasswordError()}
                        leftIcon={<LockIcon width={20} height={20} color={colors.textSecondary} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        }
                    />

                    <Button
                        title="Lanjutkan"
                        onPress={handleSubmit}
                        disabled={!isValid()}
                        style={styles.submitButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 20,
        backgroundColor: '#FAFAFA',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
    },
    submitButton: {
        marginTop: 10,
    }
});
