import StarIcon from '@/assets/icon/notifications/star.svg';
import WalletIcon from '@/assets/icon/notifications/empty-wallet.svg';
import { Colors } from '@/constants/theme';
import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContentLoader, { Rect } from "react-content-loader/native";
import { useTheme } from '@/hooks/useTheme';

interface NotificationItem {
  id: string;
  userId: string;
  notificationCategory: string;
  notificationTitle: string;
  notificationRemark: string;
  notificationAction: string;
  notificationTimeInMillisecond: string;
}

const fetchNotifications = async ({ pageParam = 0 }) => {
  const { data } = await axiosInstance.get(`/api/mobile/v1/users/notification?size=20&page=${pageParam}`);
  return data;
};

const NotificationSkeleton = () => {
  const { colors, isDarkMode } = useTheme();
  return (
    <View style={[styles.notificationCard, { borderBottomColor: isDarkMode ? colors.backgroundSelected : '#F0F0F0' }]}>
      <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
        <ContentLoader viewBox="0 0 40 40" width={40} height={40} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
          <Rect x="0" y="0" rx="8" ry="8" width="40" height="40" />
        </ContentLoader>
      </View>
      <View style={styles.textContainer}>
        <ContentLoader viewBox="0 0 250 55" width="100%" height={55} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
          <Rect x="0" y="4" rx="4" ry="4" width="150" height="14" />
          <Rect x="0" y="26" rx="4" ry="4" width="250" height="12" />
          <Rect x="0" y="44" rx="4" ry="4" width="40" height="10" />
        </ContentLoader>
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.last) {
        return lastPage.number + 1;
      }
      return undefined;
    },
  });

  const flattenedData = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const renderIcon = (category: string) => {
    switch (category) {
      case "POIN_ADJUSTMENT":
        return <StarIcon width={20} height={20} color={Colors.danger} />;
      case "WARRANTY_CLAIM":
      case "VOID_ACTIVATION":
      case "WARRANTY_ACTIVATION":
      default:
        return <WalletIcon width={20} height={20} color={Colors.danger} />;
    }
  };

  const renderItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    const timestamp = parseInt(item.notificationTimeInMillisecond);
    const date = new Date(timestamp);
    const dateString = format(date, 'dd MMM yyyy');
    
    let showHeader = false;
    if (index === 0) {
      showHeader = true;
    } else {
      const prevItem = flattenedData[index - 1];
      const prevDate = format(new Date(parseInt(prevItem.notificationTimeInMillisecond)), 'dd MMM yyyy');
      if (prevDate !== dateString) {
        showHeader = true;
      }
    }

    const isRedTitle = item.notificationTitle === "Poin Dikembalikan";

    return (
      <View>
        {showHeader && (
          <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>{dateString}</Text>
        )}
        <View style={[styles.notificationCard, { borderBottomColor: isDarkMode ? colors.backgroundSelected : '#F0F0F0' }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2A1C1C' : '#FFF0F0' }]}>
            {renderIcon(item.notificationCategory)}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }, isRedTitle && { color: Colors.danger }]}>{item.notificationTitle}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{item.notificationRemark}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{format(date, 'HH:mm')}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: isDarkMode ? colors.backgroundSelected : '#F0F0F0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifikasi</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.listContent}>
          <ContentLoader viewBox="0 0 100 20" width={100} height={20} style={{ marginTop: 20, marginBottom: 10 }} backgroundColor={isDarkMode ? colors.backgroundElement : "#f3f3f3"} foregroundColor={isDarkMode ? colors.backgroundSelected : "#ecebeb"}>
            <Rect x="0" y="0" rx="4" ry="4" width="80" height="12" />
          </ContentLoader>
          {[...Array(6)].map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={flattenedData}
          keyExtractor={(item, index) => item.id + '-' + index}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={Colors.danger} style={{ marginVertical: 20 }} />
            ) : null
          }
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    marginBottom: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});
