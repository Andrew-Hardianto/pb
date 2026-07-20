import HomeAddress from '@/components/molecules/home-address/home-address';
import HomePoints from '@/components/molecules/home-points/home-points';
import HomeHeader from '@/components/organisms/home-header/home-header';
import NewsCarousel from '@/components/organisms/news-carousel/news-carousel';
import WarrantyInfo from '@/components/organisms/warranty-info/warranty-info';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';

const fetchProfileData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/profile');
    return data?.data || data;
};

function HomeScreen() {
    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfileData,
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <HomeHeader isLoading={isProfileLoading} data={profileData} />
                <HomeAddress isLoading={isProfileLoading} data={profileData} />
                <HomePoints />
                <NewsCarousel />
                <WarrantyInfo />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#F7F7F7',
    }
});

export default HomeScreen;