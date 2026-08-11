import { Skeleton } from '@/components/atoms/skeleton';
import { NoData } from '@/components/molecules/no-data';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { formatDate, formatDateTime } from '@/utils/date';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_TABS = [
    { name: "Diproses", value: "REQUESTED" },
    { name: "Disetujui", value: "APPROVED" },
    { name: "Ditolak", value: "REJECTED" },
    { name: "Dikirim ke Gudang", value: "SHIPPED_TO_WAREHOUSE" },
    { name: "Dikirim ke Toko", value: "SHIPPED_TO_SHOP" },
    { name: "Selesai", value: "FINISHED" },
    { name: "Batal", value: "CANCELED" },
];

const getBadgeStyles = (status: string) => {
    switch (status) {
        case 'REQUESTED':
            return { bg: '#FFF5E5', text: '#E69526' };
        case 'APPROVED':
        case 'FINISHED':
        case 'SHIPPED_TO_SHOP':
        case 'SHIPPED_TO_WAREHOUSE':
            return { bg: '#E6F8EB', text: '#00A63F' };
        case 'REJECTED':
        case 'CANCELED':
            return { bg: '#FDEBEC', text: '#E62129' };
        default:
            return { bg: '#EBF6FC', text: '#2888D1' };
    }
};

export default function StatusKlaimScreen() {
    const { colors, isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState(STATUS_TABS[0]);

    const { data: claims, isLoading } = useQuery({
        queryKey: ['warranty-claims', activeTab.value],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/mobile/v1/warranty-claims?status=${activeTab.value}`);
            return data?.data || data || [];
        }
    });

    const renderCard = ({ item }: { item: any }) => {
        const badgeStyle = getBadgeStyles(activeTab.value);
        return (
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]}>
                {/* Header Card */}
                <View style={styles.cardHeader}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        Tanggal Klaim : <Text style={{ fontFamily: 'sans-bold', color: colors.text }}>{formatDate(item.createdAt || item.claimDate)}</Text>
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                        <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{activeTab.name}</Text>
                    </View>
                </View>

                {/* Claim Number Row */}
                <View style={[styles.claimNumberRow, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FAFAFA' }]}>
                    <Feather name="file-text" size={16} color={colors.text} />
                    <Text style={[styles.claimNumberText, { color: colors.text }]}>{item.requestNo || '-'}</Text>
                </View>

                <View style={styles.categoryRow}>
                    <Text style={styles.categoryTitle}>E-MOTOR</Text>
                    <Text style={[styles.ownerText, { color: colors.textSecondary }]}>{item.submitByType == "BRANCH" ? "Cabang" : "Pembeli"}</Text>
                </View>

                <Text style={[styles.frameNumber, { color: colors.text }]}>{item.frameNo || '-'}</Text>

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
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Status Klaim</Text>
                </View>
                <TouchableOpacity style={[styles.filterBtn, { borderColor: isDarkMode ? '#444' : '#EAEAEA' }]}>
                    <Feather name="filter" size={16} color={colors.text} />
                    <Text style={[styles.filterBtnText, { color: colors.text }]}>Filter</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainerWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {STATUS_TABS.map((tab) => {
                        const isActive = activeTab.value === tab.value;
                        return (
                            <TouchableOpacity
                                key={tab.value}
                                style={[
                                    styles.tabBtn,
                                    isActive ? styles.tabBtnActive : [styles.tabBtnInactive, { borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={isActive ? styles.tabTextActive : [styles.tabTextInactive, { color: '#999' }]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List */}
            <View style={{ flex: 1, backgroundColor: isDarkMode ? colors.backgroundElement : '#F5F5F5' }}>
                {isLoading ? (
                    <View style={styles.listContent}>
                        {[1, 2, 3].map(key => (
                            <View key={key} style={[styles.card, { backgroundColor: colors.background, borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA', marginTop: key === 1 ? 15 : 0 }]}>
                                <View style={styles.cardHeader}>
                                    <Skeleton width={150} height={16} />
                                    <Skeleton width={60} height={24} style={{ borderRadius: 4 }} />
                                </View>
                                <Skeleton width="100%" height={36} style={{ marginBottom: 16, borderRadius: 8 }} />
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
                            </View>
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={claims}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        renderItem={renderCard}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<NoData />}
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
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'sans-bold',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    filterBtnText: {
        fontSize: 13,
        fontFamily: 'sans-medium',
    },
    tabsContainerWrapper: {
        marginBottom: 15,
    },
    tabsContainer: {
        paddingHorizontal: 20,
        gap: 10,
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
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 40,
        gap: 15,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'sans-bold',
    },
    claimNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    claimNumberText: {
        fontSize: 14,
        fontFamily: 'sans-bold',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryTitle: {
        color: '#E62129',
        fontSize: 14,
        fontFamily: 'sans-bold',
    },
    ownerText: {
        fontSize: 12,
        fontFamily: 'sans-medium',
    },
    frameNumber: {
        fontSize: 13,
        fontFamily: 'sans-medium',
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        marginTop: 4,
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
        marginBottom: 6,
    },
    detailValue: {
        fontSize: 12,
        fontFamily: 'sans-bold',
    }
});
