import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { axiosInstance } from '@/lib/axiosInstance';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Button } from '@/components/atoms/button';
import { uploadPicture } from '@/services/upload.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const queryClient = useQueryClient();

  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [backgroundPicture, setBackgroundPicture] = useState('');

  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<'profile' | 'background' | null>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/mobile/v1/profile');
      return data?.data || data;
    },
  });

  useEffect(() => {
    if (profileData) {
      setUserName(profileData.name || '');
      setProfilePicture(profileData.profilePicture || '');
      setBackgroundPicture(profileData.backgroundPicture || '');
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.post('/api/mobile/v1/profile', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.back();
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      // Handle error here
    }
  });

  const handleSave = () => {
    const payload: any = {
      name: userName,
    };
    updateProfileMutation.mutate(payload);
  };

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    setIsPhotoModalVisible(false);
    
    let result;
    if (source === 'camera') {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your camera!");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: photoTarget === 'background' ? [16, 9] : [1, 1],
        quality: 0.5,
      });
    } else {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: photoTarget === 'background' ? [16, 9] : [1, 1],
        quality: 0.5,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        const uploadRes: any = await uploadPicture('PROFILE', asset.uri, asset.fileName || 'profile_image.jpg');
        
        const dataPath = uploadRes?.data?.path || uploadRes?.path;
        
        if (dataPath) {
          if (photoTarget === 'profile') {
            await axiosInstance.post('/api/mobile/v1/profile/update-profile-picture', {
              profilePicture: dataPath
            });
            setProfilePicture(asset.uri);
          } else if (photoTarget === 'background') {
            await axiosInstance.post('/api/mobile/v1/profile/update-background-picture', {
              backgroundPicture: dataPath
            });
            setBackgroundPicture(asset.uri);
          }
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      } catch (error) {
        console.error('Upload failed', error);
      }
    }
  };

  const openPhotoModal = (target: 'profile' | 'background') => {
    setPhotoTarget(target);
    setIsPhotoModalVisible(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#FAFAFA' }]}>
        <ActivityIndicator size="large" color="#E62129" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#FAFAFA' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={isDarkMode ? '#FFF' : '#111'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111' }]}>Pengaturan Profil</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Images Section */}
          <View style={styles.imagesContainer}>
            {/* Background Image */}
            <View style={styles.backgroundWrapper}>
              <Image 
                source={{ uri: backgroundPicture || 'https://via.placeholder.com/350x150' }} 
                style={styles.backgroundImage} 
              />
              <View style={styles.backgroundActions}>
                <TouchableOpacity style={styles.iconButtonRed} onPress={() => setBackgroundPicture('')}>
                  <Feather name="trash-2" size={16} color="#E62129" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonBlue} onPress={() => openPhotoModal('background')}>
                  <Feather name="edit-2" size={16} color="#0062FF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Profile Image */}
            <View style={styles.profileWrapper}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: profilePicture || 'https://via.placeholder.com/100' }} 
                  style={[styles.profileImage, { borderColor: isDarkMode ? colors.backgroundElement : '#FFF' }]} 
                />
                <TouchableOpacity style={styles.profileEditButton} onPress={() => openPhotoModal('profile')}>
                  <Feather name="edit-2" size={14} color="#0062FF" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileTextContainer}>
                <Text style={[styles.profileNameText, { color: isDarkMode ? '#FFF' : '#111' }]}>{userName || '-'}</Text>
                <Text style={styles.profileEmailText}>{profileData?.email || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Input 
              label="Nama Lengkap" 
              value={userName}
              onChangeText={setUserName}
            />
            
            <Input 
              label="Email" 
              value={profileData?.email || ''}
              editable={false}
              style={{ color: '#888' }}
              inputWrapperStyle={styles.disabledInput}
            />
            
            <Input 
              label="User ID" 
              value={profileData?.username || ''}
              editable={false}
              style={{ color: '#888' }}
              inputWrapperStyle={styles.disabledInput}
            />
            
            <Input 
              label="Toko" 
              value={profileData?.shopName || ''}
              editable={false}
              style={{ color: '#888' }}
              inputWrapperStyle={styles.disabledInput}
            />

            <Select
              label="Provinsi"
              value={profileData?.province || ''}
              inputWrapperStyle={styles.disabledInput}
              onPress={() => {}}
            />

            <Select
              label="Kota"
              value={profileData?.city || ''}
              inputWrapperStyle={styles.disabledInput}
              onPress={() => {}}
            />

            <Select
              label="Kodepos"
              value={profileData?.zipCode || ''}
              inputWrapperStyle={styles.disabledInput}
              onPress={() => {}}
            />

            <Input 
              label="Alamat" 
              value={profileData?.address || ''}
              editable={false}
              multiline
              style={{ color: '#888', height: 80, textAlignVertical: 'top' }}
              inputWrapperStyle={[styles.disabledInput, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF', borderColor: isDarkMode ? '#333' : '#EAEAEA' }]}>
        <Button 
          title="Cancel" 
          onPress={() => router.back()}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <Button 
          title="Simpan Perubahan" 
          onPress={handleSave}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
          disabled={updateProfileMutation.isPending}
        />
      </View>

      {/* Photo Picker Bottom Sheet Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={[styles.bottomSheet, { backgroundColor: isDarkMode ? colors.backgroundElement : '#E8EBEF' }]}>
            <View style={styles.bottomSheetHandle} />
            <Text style={[styles.bottomSheetTitle, { color: isDarkMode ? '#FFF' : '#111' }]}>Ganti Foto Profile</Text>
            
            <TouchableOpacity style={styles.sheetOption} onPress={() => handlePickImage('gallery')}>
              <Text style={[styles.sheetOptionText, { color: isDarkMode ? '#FFF' : '#111' }]}>Pilih dari galeri</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sheetOption} onPress={() => handlePickImage('camera')}>
              <Text style={[styles.sheetOptionText, { color: isDarkMode ? '#FFF' : '#111' }]}>Ambil foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sheetCancel, { backgroundColor: isDarkMode ? '#333' : '#DDE1E6' }]} 
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'sans-bold',
    fontSize: 18,
  },
  content: {
    paddingBottom: 24,
  },
  imagesContainer: {
    marginBottom: 24,
  },
  backgroundWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#EAEAEA',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  iconButtonRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonBlue: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
  },
  profileEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileTextContainer: {
    marginTop: 40,
  },
  profileNameText: {
    fontFamily: 'sans-bold',
    fontSize: 16,
    marginBottom: 4,
  },
  profileEmailText: {
    fontFamily: 'sans-regular',
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  disabledInput: {
    backgroundColor: '#EFEFEF',
    borderColor: '#EFEFEF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FEECEE',
  },
  cancelButtonText: {
    color: '#E62129',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00A63F',
  },
  saveButtonText: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontFamily: 'sans-bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE1E6',
  },
  sheetOptionText: {
    fontFamily: 'sans-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  sheetCancel: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontFamily: 'sans-bold',
    fontSize: 16,
    color: '#E62129',
  },
});
