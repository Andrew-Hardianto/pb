import ScanIcon from '@/assets/icon/general/scan.svg';
import WalletIcon from '@/assets/icon/tabbar/wallet.svg';
import { Input } from '@/components/atoms/input';
import { Skeleton } from '@/components/atoms/skeleton';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { formatDate, formatDateTime } from '@/utils/date';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function GaransiScreen() {
    const { colors, isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<'Active' | 'Expired'>('Active');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: activations, isLoading } = useQuery({
        queryKey: ['activations', activeTab],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/mobile/v1/activations?status=${activeTab}`);
            return data?.data || data || [];
        }
    });

    const filteredActivations = useMemo(() => {
        if (!activations || !Array.isArray(activations)) return [];
        if (!searchQuery) return activations;

        const lowerQuery = searchQuery.toLowerCase();
        return activations.filter((item: any) => {
            return (
                (item.frameNumber && item.frameNumber.toLowerCase().includes(lowerQuery)) ||
                (item.couponNumber && item.couponNumber.toLowerCase().includes(lowerQuery)) ||
                (item.engineNumber && item.engineNumber.toLowerCase().includes(lowerQuery)) ||
                (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(lowerQuery))
            );
        });
    }, [activations, searchQuery]);

    const renderCard = ({ item }: { item: any }) => {
        return (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]}>
                {/* Header Card */}
                <View style={styles.cardHeader}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        Tanggal Aktivasi : {formatDate(item.submitDatetime)}
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.status || (activeTab === 'Active' ? 'Aktif' : 'Kadaluwarsa')}</Text>
                    </View>
                </View>

                {/* Body Card */}
                <Text style={styles.categoryTitle}>E-MOTOR</Text>
                <Text style={[styles.frameNumber, { color: colors.text }]}>{item.frameNo}</Text>

                <View style={styles.detailsRow}>
                    <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nomor Kupon</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{item.voucherCode || '-'}</Text>
                    </View>
                    <View style={[styles.detailCol, styles.colBorder, { borderLeftColor: isDarkMode ? '#444' : '#EAEAEA' }]}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nomor Invoice</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{item.invoiceNo || '-'}</Text>
                    </View>
                    <View style={[styles.detailCol, styles.colBorder, { borderLeftColor: isDarkMode ? '#444' : '#EAEAEA' }]}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Garansi Hingga</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{formatDateTime(item.expiredDatetime)}</Text>
                    </View>
                </View>

                <View style={styles.engineRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nomor Motor</Text>
                    <Text style={[styles.engineValue, { color: colors.text }]}>{item.motorNo || '-'}</Text>
                </View>

                {/* Footer Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.btnDetail]}
                        onPress={() => router.push({ pathname: '/activation', params: { activationId: item.id } })}
                    >
                        <Text style={styles.btnDetailText}>Detail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnClaim]}>
                        <Text style={styles.btnClaimText}>Klaim Garansi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Main Header */}
            <View style={{ backgroundColor: colors.background }}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <WalletIcon width={24} height={24} color={Colors.danger} />
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Garansi</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerBtnSecondary}>
                            <Text style={styles.headerBtnSecondaryText}>Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtnPrimary} onPress={() => router.push('/scan')}>
                            <ScanIcon width={16} height={16} color={Colors.danger} />
                            <Text style={styles.headerBtnPrimaryText}>Aktivasi</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'Active' ? styles.tabBtnActive : [styles.tabBtnInactive, { borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]]}
                        onPress={() => setActiveTab('Active')}
                    >
                        <Text style={activeTab === 'Active' ? styles.tabTextActive : [styles.tabTextInactive, { color: colors.textSecondary }]}>Aktif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'Expired' ? styles.tabBtnActive : [styles.tabBtnInactive, { borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]]}
                        onPress={() => setActiveTab('Expired')}
                    >
                        <Text style={activeTab === 'Expired' ? styles.tabTextActive : [styles.tabTextInactive, { color: colors.textSecondary }]}>Kadaluwarsa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, backgroundColor: colors.backgroundElement }}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Cari nomor rangka, kupon, atau nomor mesin..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon={<Feather name="search" size={20} color={colors.textSecondary} />}
                        inputWrapperStyle={[styles.searchInput, { backgroundColor: colors.background }]}
                    />
                </View>

                {/* List */}
            {isLoading ? (
                <View style={styles.listContent}>
                    {[1, 2, 3].map(key => (
                        <View key={key} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA', marginTop: key === 1 ? 15 : 0 }]}>
                            <View style={styles.cardHeader}>
                                <Skeleton width={150} height={16} />
                                <Skeleton width={60} height={24} />
                            </View>
                            <Skeleton width={100} height={16} style={{ marginBottom: 12 }} />
                            <Skeleton width={160} height={16} style={{ marginBottom: 20 }} />

                            <View style={styles.detailsRow}>
                                <View style={styles.detailCol}>
                                    <Skeleton width={80} height={12} style={{ marginBottom: 8 }} />
                                    <Skeleton width={90} height={14} />
                                </View>
                                <View style={[styles.detailCol, styles.colBorder, { borderLeftColor: isDarkMode ? '#444' : '#EAEAEA' }]}>
                                    <Skeleton width={80} height={12} style={{ marginBottom: 8 }} />
                                    <Skeleton width={90} height={14} />
                                </View>
                                <View style={[styles.detailCol, styles.colBorder, { borderLeftColor: isDarkMode ? '#444' : '#EAEAEA' }]}>
                                    <Skeleton width={80} height={12} style={{ marginBottom: 8 }} />
                                    <Skeleton width={90} height={14} />
                                </View>
                            </View>

                            <View style={styles.engineRow}>
                                <Skeleton width={80} height={12} style={{ marginBottom: 8 }} />
                                <Skeleton width={120} height={14} />
                            </View>

                            <View style={styles.actionRow}>
                                <Skeleton width={'48%'} height={40} />
                                <Skeleton width={'48%'} height={40} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={filteredActivations}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerBox}>
                            <Text style={{ color: colors.textSecondary }}>Tidak ada data ditemukan.</Text>
                        </View>
                    }
                />
            )}
        </View>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'sans-bold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    headerBtnSecondary: {
        backgroundColor: '#FDEBEC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    headerBtnSecondaryText: {
        color: '#E62129',
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
    headerBtnPrimary: {
        backgroundColor: '#FDEBEC',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    headerBtnPrimaryText: {
        color: '#E62129',
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 15,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    tabBtnActive: {
        borderColor: '#E62129',
        backgroundColor: '#FFF',
    },
    tabBtnInactive: {
        backgroundColor: '#FFF',
    },
    tabTextActive: {
        color: '#E62129',
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
    tabTextInactive: {
        fontSize: 13,
        fontFamily: 'sans-medium',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 5,
        marginTop: 10,
    },
    searchInput: {
        height: 48,
        borderRadius: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        gap: 15,
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'sans-regular',
    },
    badge: {
        backgroundColor: '#EBF6FC',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#2888D1',
        fontSize: 11,
        fontFamily: 'sans-bold',
    },
    categoryTitle: {
        color: '#E62129',
        fontSize: 14,
        fontFamily: 'sans-bold',
        marginBottom: 8,
    },
    frameNumber: {
        fontSize: 13,
        fontFamily: 'sans-medium',
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    detailCol: {
        flex: 1,
    },
    colBorder: {
        borderLeftWidth: 1,
        paddingLeft: 10,
    },
    detailLabel: {
        fontSize: 11,
        fontFamily: 'sans-regular',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 12,
        fontFamily: 'sans-bold',
    },
    engineRow: {
        marginBottom: 20,
    },
    engineValue: {
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDetail: {
        backgroundColor: '#FDEBEC',
    },
    btnDetailText: {
        color: '#E62129',
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
    btnClaim: {
        backgroundColor: '#05A62E',
    },
    btnClaimText: {
        color: '#FFF',
        fontSize: 13,
        fontFamily: 'sans-bold',
    },
});