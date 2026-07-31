import HomeAddress from '@/components/molecules/home-address/home-address';
import HomePoints from '@/components/molecules/home-points/home-points';
import HomeHeader from '@/components/organisms/home-header/home-header';
import NewsCarousel from '@/components/organisms/news-carousel/news-carousel';
import WarrantyInfo from '@/components/organisms/warranty-info/warranty-info';
import { axiosInstance } from '@/lib/axiosInstance';
import { decrypt, encrypt } from '@/services/crypto.service';
import { postUrlApi } from '@/services/http.service';
import { getSecure, setSecure } from '@/services/storage.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Application from 'expo-application';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import TermsConditionsModal from '@/components/organisms/terms-conditions-modal/terms-conditions-modal';

const fetchProfileData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/profile');
    const res = data?.data || data;
    await setSecure("WBMJ23V89Y", encrypt(JSON.stringify(res)));
    return res;
};

const fetchTermConditionsData = async () => {
    const { data } = await axiosInstance.get('/api/mobile/v1/term-conditions');
    return data?.data || data;
};

function HomeScreen() {
    const { colors, isDarkMode } = useTheme();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries();
        setRefreshing(false);
    }, [queryClient]);

    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfileData,
    });

    const { data: termConditionsData } = useQuery({
        queryKey: ['term-conditions'],
        queryFn: fetchTermConditionsData,
        enabled: !!profileData,
    });

    const [isTCModalVisible, setIsTCModalVisible] = useState(false);

    useEffect(() => {
        if (profileData) {
            getDevice(profileData);
            if (profileData.isTCRead === false) {
                setIsTCModalVisible(true);
            }
        }
    }, [profileData]);

    const getDevice = async (profile: any) => {
        let identifier = Platform.OS === 'android'
            ? Application.getAndroidId()
            : await Application.getIosIdForVendorAsync();

        if (!identifier) return;

        await setSecure("uuid", encrypt(identifier));

        let firebaseTokenRaw = await getSecure("C2DZDDVP4L");
        let firebaseToken = firebaseTokenRaw ? decrypt(firebaseTokenRaw) : null;

        if (firebaseToken && firebaseToken.startsWith('"') && firebaseToken.endsWith('"')) {
            try {
                firebaseToken = JSON.parse(firebaseToken);
            } catch (e) { }
        }

        postUniqueId(identifier, firebaseToken, profile);
    };

    const postUniqueId = async (uuid: string, firebaseToken: any, profile: any) => {
        let urlApi = "/api/mobile/v1/users/notification/token";

        let payload = {
            deviceId: uuid,
            tokenId: firebaseToken,
            userId: profile.id,
        };

        if (payload.tokenId != null) {
            try {
                await postUrlApi(urlApi, payload);
            } catch (error) {
                console.log("Failed to post unique ID:", error);
            }
        }
    };

    const submitTC = async () => {
        await postUrlApi("/api/mobile/v1/term-conditions/mark-read", {});
        setIsTCModalVisible(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#FFFFFF' }]} edges={['top']}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { backgroundColor: isDarkMode ? colors.background : '#F7F7F7' }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <HomeHeader isLoading={isProfileLoading} data={profileData} />
                <HomeAddress isLoading={isProfileLoading} data={profileData} />
                <HomePoints />
                <NewsCarousel />
                <WarrantyInfo />
            </ScrollView>
            
            <TermsConditionsModal 
                visible={isTCModalVisible} 
                data={termConditionsData} 
                onSubmit={submitTC} 
            />
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