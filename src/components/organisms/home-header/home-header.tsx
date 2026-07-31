import { icons } from '@/constants/icons';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const HomeHeader = ({ isLoading, data }: { isLoading?: boolean; data?: any }) => {
    const { colors, isDarkMode } = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.leftSection}>
                    <ContentLoader viewBox="0 0 200 48" width={200} height={48} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
                        <Circle cx="24" cy="24" r="24" />
                        <Rect x="60" y="8" rx="4" ry="4" width="100" height="14" />
                        <Rect x="60" y="28" rx="4" ry="4" width="140" height="12" />
                    </ContentLoader>
                </View>
                <View style={styles.rightSection}>
                    <ContentLoader viewBox="0 0 90 40" width={90} height={40} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
                        <Rect x="0" y="0" rx="8" ry="8" width="40" height="40" />
                        <Rect x="50" y="0" rx="8" ry="8" width="40" height="40" />
                    </ContentLoader>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.leftSection}>
                <Image
                    source={data?.profilePicture ? { uri: data.profilePicture } : require('@/assets/images/pb/default-image.png')}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={[styles.greeting, { color: colors.text }]}>Hi, {data?.name || '-'}</Text>
                    <Text style={[styles.storeName, { color: colors.textSecondary }]}>{data?.shopName || '-'}</Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FAFAFA' }]}>
                    <icons.userAdd width={24} height={24} color={colors.text} />
                </TouchableOpacity>
                <Link href="/notifications" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.iconButton, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FAFAFA' }])}>
                        <View style={[styles.badge, { borderColor: isDarkMode ? colors.backgroundElement : '#FAFAFA' }]} />
                        <Feather name="bell" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    textContainer: {
        gap: 2,
    },
    greeting: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    storeName: {
        fontSize: 14,
        color: Colors.medium,
    },
    rightSection: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.danger,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#FAFAFA',
    }
});

export default HomeHeader;
