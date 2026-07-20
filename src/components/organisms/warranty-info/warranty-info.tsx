import { Colors } from '@/constants/theme';
import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import { StyleSheet, Text, View } from 'react-native';

const fetchDashboardData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/dashboard');
    return data?.data || data; // handle { data: {...} } or {...}
};

const WarrantyInfo = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboardData,
    });

    const warrantyData = [
        {
            id: '1',
            title: 'Aktivasi',
            count: data?.totalActivationCount ?? 0,
            iconName: 'shield',
            color: Colors.success,
            bgColor: '#E6F6EA',
        },
        {
            id: '2',
            title: 'Diproses',
            count: data?.inProgressWarrantyClaimCount ?? 0,
            iconName: 'clock',
            color: Colors.secondary,
            bgColor: '#E6F0FB',
        },
        {
            id: '3',
            title: 'Selesai',
            count: data?.finishedWarrantyClaimCount ?? 0,
            iconName: 'check-square',
            color: Colors.tertiary,
            bgColor: '#EFE6FB',
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Info Garansi</Text>
            {isLoading ? (
                <View style={styles.cardsContainer}>
                    {[1, 2, 3].map((item) => (
                        <View key={item} style={[styles.card, { borderBottomColor: '#E0E0E0' }]}>
                            <ContentLoader viewBox="0 0 100 80" width="100%" height={80}>
                                <Rect x="0" y="0" rx="8" ry="8" width="32" height="32" />
                                <Rect x="0" y="44" rx="4" ry="4" width="60" height="12" />
                                <Rect x="0" y="60" rx="4" ry="4" width="40" height="20" />
                            </ContentLoader>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.cardsContainer}>
                    {warrantyData.map((item) => (
                        <View
                            key={item.id}
                            style={[
                                styles.card,
                                { borderBottomColor: item.color }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                                <Feather name={item.iconName as any} size={16} color={item.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.count}>{item.count}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    loaderContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderBottomWidth: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    textContainer: {
        gap: 4,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    count: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    }
});

export default WarrantyInfo;
