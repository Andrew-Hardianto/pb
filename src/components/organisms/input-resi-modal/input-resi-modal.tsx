import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { FileUpload } from '@/components/atoms/file-upload';
import { SearchableModal } from '@/components/molecules/searchable-modal';
import * as DocumentPicker from 'expo-document-picker';
import { axiosInstance } from '@/lib/axiosInstance';
import { uploadPicture } from '@/services/upload.service';
import { showPopup } from '@/stores/popupStore';
import { handleHttpError } from '@/utils/httpError';

interface InputResiModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    id: string;
    menuName: string;
}

const InputResiModal: React.FC<InputResiModalProps> = ({ visible, onClose, onSuccess, id, menuName }) => {
    const [noResi, setNoResi] = useState('');
    const [shippingService, setShippingService] = useState<any>(null);
    const [uploadFile, setUploadFile] = useState<any>(null);

    const [shippingServices, setShippingServices] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchShippingServices();
        } else {
            // Reset state on close
            setNoResi('');
            setShippingService(null);
            setUploadFile(null);
        }
    }, [visible]);

    const fetchShippingServices = async () => {
        try {
            const res = await axiosInstance.get('/api/v1/lookup/shipping-services');
            if (res.data && res.data.data) {
                setShippingServices(res.data.data);
            } else if (Array.isArray(res.data)) {
                setShippingServices(res.data);
            }
        } catch (error) {
            console.error('Error fetching shipping services:', error);
        }
    };

    const handleSelectFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            if (file.size && file.size > 5 * 1024 * 1024) {
                showPopup({
                    type: 'error',
                    title: 'Error',
                    message: 'Ukuran file maksimal 5MB',
                    primaryButtonText: 'Tutup'
                });
                return;
            }

            setIsUploading(true);
            
            const res = await uploadPicture('TO_WAREHOUSE_AWB', file.uri, file.name);
            
            if (res.data && res.data.data) {
                setUploadFile(res.data.data);
            } else {
                setUploadFile(res.data);
            }
        } catch (error: any) {
            handleHttpError(error);
        } finally {
            setIsUploading(false);
        }
    };

    const isFormComplete = Boolean(noResi && shippingService && uploadFile);

    const handleSubmit = async () => {
        if (!noResi) {
            showPopup({
                type: 'error',
                title: 'Error',
                message: 'Silakan masukkan nomor resi',
                primaryButtonText: 'Tutup'
            });
            return;
        }
        if (!shippingService) {
            showPopup({
                type: 'error',
                title: 'Error',
                message: 'Silakan pilih ekspedisi',
                primaryButtonText: 'Tutup'
            });
            return;
        }
        if (!uploadFile) {
            showPopup({
                type: 'error',
                title: 'Error',
                message: 'Silakan upload foto resi (PDF)',
                primaryButtonText: 'Tutup'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const featurePath = menuName === "Klaim Garansi" ? "warranty-claims" :
                menuName === "Retur" ? "return-requests" : "component-return-requests";

            const urlApi = `/api/mobile/v1/${featurePath}/${id}/to-warehouse-awb`;

            const attch = {
                id: uploadFile.id,
                path: uploadFile.path,
                size: uploadFile.size,
                name: uploadFile.name,
                fileType: uploadFile.fileType
            };

            const payload = {
                awbNo: noResi,
                shippingServiceName: shippingService?.name || shippingService?.label || shippingService,
                attachment: attch
            };

            const res = await axiosInstance.post(urlApi, payload);
            if (res.status === 200 || res.status === 201) {
                showPopup({
                    type: 'success',
                    title: 'Sukses',
                    message: res.data?.message || 'Nomor resi berhasil diinput',
                    primaryButtonText: 'OK',
                    onPrimaryPress: () => {
                        onSuccess();
                        onClose();
                    }
                });
            }
        } catch (error: any) {
            handleHttpError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Input Nomor Resi</Text>

                    <Input
                        label="Nomor Resi"
                        required
                        placeholder="Masukkan nomor resi"
                        value={noResi}
                        onChangeText={setNoResi}
                    />

                    <Select
                        label="Ekspedisi"
                        required
                        placeholder="Select an option"
                        value={shippingService?.name || shippingService?.label || (typeof shippingService === 'string' ? shippingService : '')}
                        onPress={() => setShowDropdown(true)}
                    />

                    <FileUpload
                        label="Foto"
                        required
                        placeholder="No file chosen"
                        value={uploadFile ? uploadFile.name : (isUploading ? 'Uploading...' : null)}
                        helperText="Format PDF, maks. 5MB"
                        onPress={handleSelectFile}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onClose}
                            disabled={isSubmitting || isUploading}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                styles.submitButton,
                                isFormComplete ? styles.submitButtonActive : null
                            ]} 
                            onPress={handleSubmit}
                            disabled={!isFormComplete || isSubmitting || isUploading}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={isFormComplete ? "#FFF" : "#111"} />
                            ) : (
                                <Text style={[
                                    styles.buttonText, 
                                    styles.submitButtonText,
                                    isFormComplete ? styles.submitButtonTextActive : null
                                ]}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <SearchableModal
                visible={showDropdown}
                title="Pilih Ekspedisi"
                placeholder="Cari ekspedisi..."
                data={shippingServices}
                value={shippingService}
                getLabel={(item) => item?.name || item?.label || item}
                onClose={() => setShowDropdown(false)}
                onSelect={(item) => {
                    setShippingService(item);
                    setShowDropdown(false);
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontFamily: 'sans-bold',
        fontSize: 18,
        color: '#111',
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FDEBEC',
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: '#EAEAEA',
        marginLeft: 8,
    },
    submitButtonActive: {
        backgroundColor: '#E62129',
    },
    buttonText: {
        fontFamily: 'sans-bold',
        fontSize: 14,
    },
    cancelButtonText: {
        color: '#E62129',
    },
    submitButtonText: {
        color: '#646464',
    },
    submitButtonTextActive: {
        color: '#FFFFFF',
    },
});

export default InputResiModal;
