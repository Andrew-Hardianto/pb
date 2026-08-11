import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { handleHttpError } from '@/utils/httpError';
import { showPopup } from '@/stores/popupStore';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
    const { colors } = useTheme();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);

        try {
            const response = await axiosInstance.get(`/api/mobile/v1/activations/voucher/validate?voucherCode=${data}`);
            if (response.data) {
                showPopup({
                    type: 'success',
                    title: 'Sukses',
                    message: response.data?.message || 'Voucher valid',
                    primaryButtonText: 'OK',
                    onPrimaryPress: () => router.push({ pathname: '/activation', params: { voucherCode: data } })
                });
            }
        } catch (error: any) {
            handleHttpError(error);
            setTimeout(() => setScanned(false), 2000); // Allow scanning again after 2 seconds
        }
    };

    const handleUploadGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showPopup({
                type: 'error',
                title: 'Izin Ditolak',
                message: 'Dibutuhkan izin akses galeri untuk mengupload foto.',
                primaryButtonText: 'Tutup'
            });
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            // Here you would normally process the image to read the QR code
            // But since expo-camera's scanner doesn't have an API to scan an image directly,
            // You might need a different library or backend endpoint for image upload.
            showPopup({
                type: 'success',
                title: 'Info',
                message: 'Fitur upload foto masih dalam pengembangan',
                primaryButtonText: 'Tutup'
            });
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container} />;
    }
    if (hasPermission === false) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ color: colors.text }}>Akses kamera tidak diizinkan</Text>
                <TouchableOpacity style={[styles.btnSolid, { marginTop: 20 }]} onPress={() => Camera.requestCameraPermissionsAsync()}>
                    <Text style={styles.btnSolidText}>Minta Izin</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    {/* Top Dim */}
                    <View style={styles.unfocusedContainer} />
                    
                    <View style={styles.middleContainer}>
                        <View style={styles.unfocusedContainer} />
                        
                        {/* Scanner Box */}
                        <View style={styles.focusedContainer}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        
                        <View style={styles.unfocusedContainer} />
                    </View>
                    
                    {/* Bottom Dim + Actions */}
                    <View style={styles.bottomContainer}>
                        <View style={styles.bottomDim} />
                        
                        <View style={styles.actionCard}>
                            <Text style={styles.atauText}>atau</Text>
                            
                            <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/manual-input')}>
                                <Text style={styles.btnOutlineText}>Input Manual Nomor Kupon</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.btnSolid} onPress={handleUploadGallery}>
                                <Text style={styles.btnSolidText}>Upload foto dari galeri</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        height: 250,
        borderColor: '#008CFF',
        borderWidth: 2,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#E62129',
    },
    topLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    actionCard: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 30,
        alignItems: 'center',
    },
    atauText: {
        fontSize: 14,
        fontFamily: 'sans-medium',
        color: '#666',
        marginBottom: 15,
    },
    btnOutline: {
        width: '100%',
        height: 48,
        backgroundColor: '#FDEBEC',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    btnOutlineText: {
        color: '#E62129',
        fontSize: 14,
        fontFamily: 'sans-bold',
    },
    btnSolid: {
        width: '100%',
        height: 48,
        backgroundColor: '#E62129',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnSolidText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'sans-bold',
    },
});
