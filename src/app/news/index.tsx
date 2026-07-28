import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fetchNewsData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/news');
    let res = data?.data || data;
    if (Array.isArray(res)) {
        res.forEach((element: any) => {
            if (element.attachments && element.attachments.length > 0) {
                element.image = element.attachments[0].path;
            }
        });
    }
    return Array.isArray(res) ? res : [];
};

export default function NewsScreen() {
    const { data: newsData, isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: fetchNewsData,
    });

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.newsCard}>
            <Image 
                source={{ uri: item.image }} 
                style={styles.newsImage} 
                contentFit="cover"
                transition={200}
            />
            <Text style={styles.newsTitle}>{item.title || item.name}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Berita</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={newsData}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FAFAFA',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'sans-medium',
        color: '#000',
    },
    listContainer: {
        padding: 16,
    },
    newsCard: {
        marginBottom: 24,
    },
    newsImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#E0E0E0',
    },
    newsTitle: {
        marginTop: 12,
        fontSize: 15,
        fontFamily: 'sans-medium',
        color: '#1A1A1A',
        lineHeight: 22,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
