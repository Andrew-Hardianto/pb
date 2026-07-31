import { Colors } from '@/constants/theme';
import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const fetchPointsData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/poin/balance');
    return data?.data || data;
};

const HomePoints = ({ isLoading: propIsLoading }: { isLoading?: boolean }) => {
    const { data, isLoading: queryIsLoading } = useQuery({
        queryKey: ['points'],
        queryFn: fetchPointsData,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const isLoading = propIsLoading || queryIsLoading;

    const { colors, isDarkMode } = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.card, { backgroundColor: '#E0E0E0' }]}>
                    <View style={styles.leftContent}>
                        <Feather name="star" size={24} color="#C0C0C0" />
                        <View style={styles.textContainer}>
                            <ContentLoader viewBox="0 0 100 36" width={100} height={36}>
                                <Rect x="0" y="0" rx="4" ry="4" width="60" height="12" />
                                <Rect x="0" y="20" rx="4" ry="4" width="80" height="16" />
                            </ContentLoader>
                        </View>
                    </View>
                    <View style={[styles.button, { backgroundColor: '#C0C0C0' }]} />
                </View>
                <View style={{ marginTop: 8 }}>
                    <ContentLoader viewBox="0 0 250 14" width={250} height={14} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
                        <Rect x="0" y="0" rx="4" ry="4" width="250" height="12" />
                    </ContentLoader>
                </View>
            </View>
        );
    }

    const pointsValue = data?.totalPoin ?? 0;
    const displayPoints = typeof pointsValue === 'number' ? pointsValue.toLocaleString('id-ID') : pointsValue;

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const nextMonthIndex = (new Date().getMonth() + 1) % 12;
    const nextMonthName = monthNames[nextMonthIndex];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.card}>
                <View style={styles.leftContent}>
                    <Feather name="star" size={24} color="#FFFFFF" />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Poin Anda</Text>
                        <Text style={styles.points}>{displayPoints}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Feather name="arrow-right" size={20} color={Colors.danger} />
                </TouchableOpacity>
            </View>
            {data?.expiringPoin > 0 && (
                <Text style={[styles.infoText, { color: colors.text }]}>
                    <Text style={styles.asterisk}>*</Text>Total {data?.expiringPoin.toLocaleString('id-ID')} point akan kadaluwarsa di bulan {data?.expiryMonth ?? nextMonthName}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    card: {
        backgroundColor: Colors.danger,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textContainer: {
        gap: 4,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.9,
    },
    points: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FFFFFF',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        marginTop: 8,
        fontSize: 11,
        color: '#333333',
    },
    asterisk: {
        color: Colors.danger,
    }
});

export default HomePoints;
