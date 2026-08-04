import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ManualInputScreen() {
    const { colors } = useTheme();
    const [voucherCode, setVoucherCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!voucherCode.trim()) {
            Alert.alert('Info', 'Mohon masukkan nomor kupon');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/api/mobile/v1/activations/voucher/validate?voucherCode=${voucherCode}`);
            if (response.data) {
                Alert.alert('Sukses', 'Voucher valid', [
                    { text: 'OK', onPress: () => router.push({ pathname: '/activation', params: { voucherCode } }) }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Gagal memvalidasi voucher');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{ 
                    headerShown: true, 
                    title: 'Aktivasi Garansi',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Feather name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: {
                        fontFamily: 'sans-bold',
                        fontSize: 18,
                        color: colors.text,
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: colors.background,
                    }
                }} 
            />
            
            <View style={styles.content}>
                <Input
                    label="Nomor Kupon"
                    required
                    placeholder=""
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                />
                
                <Button 
                    title="Verifikasi" 
                    onPress={handleVerify}
                    loading={isLoading}
                    disabled={!voucherCode.trim() || isLoading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    }
});
