import LockIcon from '@/assets/icon/general/lock-red.svg';
import LogoutIcon from '@/assets/icon/general/logout.svg';
import MoonIcon from '@/assets/icon/general/moon.svg';
import ProfileIcon from '@/assets/icon/general/profile.svg';
import ScanIcon from '@/assets/icon/general/scan.svg';
import { Colors } from '@/constants/theme';
import { logout } from '@/services/main-service.service';
import { axiosInstance } from '@/lib/axiosInstance';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { CustomSwitch } from '@/components/atoms/switch';
import { useAppStore } from '@/stores/appStore';
import { usePopupStore } from '@/stores/popupStore';
import { verifyBiometric } from '@/services/biometric.service';
import { getSecure, setSecure, removeSecure } from '@/services/storage.service';
import { STORAGE_KEYS } from '@/constants/data';
import { Skeleton } from '@/components/atoms/skeleton';
import { useRouter, Href } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/mobile/v1/profile');
      return data?.data || data;
    },
  });

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const { colors, isDarkMode } = useTheme();
  const setIsDarkMode = useAppStore(state => state.setIsDarkMode);
  const popup = usePopupStore();

  useEffect(() => {
    getSecure(STORAGE_KEYS.IS_SETUP_BIOMETRIC).then(val => {
      if (val === '1') {
        setIsBiometricEnabled(true);
      }
    });
  }, []);

  const handleBiometricToggle = (val: boolean) => {
    if (val) {
      popup.show({
        type: 'confirm',
        title: 'Aktivasi Sidik Jari',
        message: 'Aktifkan sidik jari untuk akses yang lebih cepat dan aman ke akun Anda.',
        primaryButtonText: 'Aktifkan',
        secondaryButtonText: 'Batalkan',
        onPrimaryPress: async () => {
          const success = await verifyBiometric();
          if (success) {
            setIsBiometricEnabled(true);
            await setSecure(STORAGE_KEYS.IS_SETUP_BIOMETRIC, '1');
          }
        },
      });
    } else {
      setIsBiometricEnabled(false);
      removeSecure(STORAGE_KEYS.IS_SETUP_BIOMETRIC);
    }
  };

  const renderMenuItem = (title: string, Icon: any, type: 'link' | 'switch', value?: boolean, onValueChange?: (val: boolean) => void, onPress?: () => void) => {
    return (
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF' }]} disabled={type === 'switch'} onPress={onPress}>
        <View style={[styles.menuIconContainer, { backgroundColor: isDarkMode ? '#2A1C1C' : '#FFF0F0' }]}>
          <Icon width={24} height={24} color={Colors.danger} />
        </View>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {type === 'link' ? (
          <Feather name="chevron-right" size={24} color={colors.text} />
        ) : (
          <CustomSwitch
            value={value || false}
            onValueChange={onValueChange!}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <ProfileIcon width={24} height={24} color={Colors.danger} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan Profil</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ marginTop: 20 }}>
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF' }]}>
                <Skeleton width={'100%'} height={120} style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, borderRadius: 0 }} />
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatarWrapper}>
                        <Skeleton width={60} height={60} borderRadius={30} style={{ borderWidth: 3, borderColor: isDarkMode ? colors.backgroundElement : '#FFF' }} />
                    </View>
                    <View style={styles.profileTexts}>
                        <Skeleton width={150} height={18} style={{ marginBottom: 6 }} />
                        <Skeleton width={200} height={14} />
                    </View>
                </View>
            </View>
            
            <View style={styles.menuContainer}>
                {[1, 2, 3, 4, 5].map(key => (
                    <View key={key} style={[styles.menuItem, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF' }]}>
                        <Skeleton width={40} height={40} borderRadius={8} style={{ marginRight: 15 }} />
                        <View style={{ flex: 1 }}>
                            <Skeleton width={120} height={16} />
                        </View>
                        <Skeleton width={24} height={24} />
                    </View>
                ))}
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF' }]}>
              <Image 
                source={{ uri: profileData?.backgroundPicture || 'https://via.placeholder.com/350x150' }} 
                style={styles.coverImage} 
                resizeMode="cover"
              />
              <View style={styles.profileInfoContainer}>
                <View style={styles.avatarWrapper}>
                  <Image 
                    source={{ uri: profileData?.profilePicture || 'https://via.placeholder.com/100' }} 
                    style={[styles.profileImage, { borderColor: isDarkMode ? colors.backgroundElement : '#FFF' }]} 
                  />
                </View>
                <View style={styles.profileTexts}>
                  <Text style={[styles.profileName, { color: colors.text }]}>{profileData?.name || '-'}</Text>
                  <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profileData?.email || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.menuContainer}>
              {renderMenuItem('Profil Saya', ProfileIcon, 'link', undefined, undefined, () => router.push('/edit-profile' as any))}
              {renderMenuItem('Ubah Kata Sandi', LockIcon, 'link', undefined, undefined, () => router.push('/change-password' as any))}
              {renderMenuItem('Sidik Jari / Scan Wajah', ScanIcon, 'switch', isBiometricEnabled, handleBiometricToggle)}
              {renderMenuItem('Mode Gelap', MoonIcon, 'switch', isDarkMode, setIsDarkMode)}
              {renderMenuItem('Keluar', LogoutIcon, 'link', undefined, undefined, logout)}
            </View>
          </>
        )}
      </ScrollView>
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
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  avatarWrapper: {
    marginTop: -30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
  profileTexts: {
    marginLeft: 15,
    marginTop: 5,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  profileEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuContainer: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});