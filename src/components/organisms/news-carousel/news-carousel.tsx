import { Colors } from '@/constants/theme';
import { axiosInstance } from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20 padding on each side

const fallbackNewsData: any[] = [];

const fetchNewsData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/news');
    return data?.data || data; // Handle different response wrappers
};

const NewsCarousel = ({ isLoading: propIsLoading }: { isLoading?: boolean }) => {
    const { data: apiData, isLoading: queryIsLoading } = useQuery({
        queryKey: ['news'],
        queryFn: fetchNewsData,
    });

    const isLoading = propIsLoading || queryIsLoading;

    // Use API data if available and is array, otherwise fallback
    const newsData = Array.isArray(apiData) && apiData.length > 0 ? apiData : fallbackNewsData;

    const [activeIndex, setActiveIndex] = useState(0);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

    if (!isLoading && newsData.length === 0) {
        return null;
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <ContentLoader viewBox="0 0 150 24" width={150} height={24}>
                        <Rect x="0" y="4" rx="4" ry="4" width="120" height="16" />
                    </ContentLoader>
                    <ContentLoader viewBox="0 0 80 30" width={80} height={30}>
                        <Rect x="0" y="0" rx="8" ry="8" width="80" height="30" />
                    </ContentLoader>
                </View>
                <View style={[styles.scrollContent, { flexDirection: 'row', overflow: 'hidden' }]}>
                    <ContentLoader viewBox={`0 0 ${CARD_WIDTH} 180`} width={CARD_WIDTH} height={180}>
                        <Rect x="0" y="0" rx="16" ry="16" width={CARD_WIDTH} height="180" />
                    </ContentLoader>
                    <View style={{ width: 16 }} />
                    <ContentLoader viewBox={`0 0 ${CARD_WIDTH} 180`} width={CARD_WIDTH} height={180}>
                        <Rect x="0" y="0" rx="16" ry="16" width={CARD_WIDTH} height="180" />
                    </ContentLoader>
                </View>
                <View style={styles.pagination}>
                    <ContentLoader viewBox="0 0 50 8" width={50} height={8}>
                        <Rect x="0" y="0" rx="4" ry="4" width="8" height="8" />
                        <Rect x="14" y="0" rx="4" ry="4" width="8" height="8" />
                        <Rect x="28" y="0" rx="4" ry="4" width="8" height="8" />
                    </ContentLoader>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Berita Untuk Anda</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Lihat Detail</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
            >
                {newsData.map((item, index) => (
                    <View key={item.id} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                    </View>
                ))}
            </ScrollView>

            <View style={styles.pagination}>
                {newsData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            activeIndex === index ? styles.activeDot : null
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: '#F7F7F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    button: {
        backgroundColor: Colors.pink,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.danger,
        fontSize: 12,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
    },
    cardContainer: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    activeDot: {
        backgroundColor: Colors.danger,
    }
});

export default NewsCarousel;
