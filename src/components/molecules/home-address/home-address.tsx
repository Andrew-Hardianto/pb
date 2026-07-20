import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import { StyleSheet, Text, View } from 'react-native';

const HomeAddress = ({ isLoading, data }: { isLoading?: boolean; data?: any }) => {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Feather name="check-circle" size={16} color="#E0E0E0" style={styles.icon} />
                <ContentLoader viewBox="0 0 300 36" width="100%" height={36}>
                    <Rect x="0" y="2" rx="4" ry="4" width="100%" height="12" />
                    <Rect x="0" y="20" rx="4" ry="4" width="70%" height="12" />
                </ContentLoader>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Feather name="check-circle" size={16} color={Colors.danger} style={styles.icon} />
            <Text style={styles.addressText} numberOfLines={2}>
                {data?.address || '-'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    icon: {
        marginTop: 2,
    },
    addressText: {
        flex: 1,
        fontSize: 12,
        color: Colors.medium,
        lineHeight: 18,
    }
});

export default HomeAddress;
