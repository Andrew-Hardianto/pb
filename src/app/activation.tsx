import { Button } from '@/components/atoms/button';
import { FileUpload } from '@/components/atoms/file-upload';
import { Input } from '@/components/atoms/input';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { formatDate } from '@/utils/date';
import { handleHttpError } from '@/utils/httpError';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivationScreen() {
    const { colors } = useTheme();
    const { activationId, voucherCode } = useLocalSearchParams<{ activationId?: string; voucherCode?: string }>();

    const [isLoading, setIsLoading] = useState(false);
    const [isInvoiceRequired, setIsInvoiceRequired] = useState(false);

    const [productInfo, setProductInfo] = useState<any>({});

    // Form fields
    const [form, setForm] = useState({
        fullname: '',
        phone: '',
        email: '',
        address: '',
        store: '',
        purchaseDate: new Date(),
        invoiceNo: '',
        invoiceFile: null as any
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchSystemSettings();
        if (activationId) {
            fetchActivationInfo(activationId);
        } else if (voucherCode) {
            fetchProductInfo(voucherCode);
        }
    }, [activationId, voucherCode]);

    const fetchSystemSettings = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/lookup/system-settings?search=WC_INVOICE_REQUIRED');
            if (response.data && response.data.length > 0) {
                setIsInvoiceRequired(response.data[0].value === 'true');
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
        }
    };

    const fetchActivationInfo = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/api/mobile/v1/activations/${id}`);
            // Map response data to productInfo and potentially pre-fill form
            if (response.data) {
                setProductInfo(response.data);
                setForm(prev => ({
                    ...prev,
                    store: response.data.shopName || '',
                    phone: response.data.submitByPhoneNumber || '',
                    email: response.data.submitByEmail || '',
                    address: response.data.shopAddress || '',
                    fullname: response.data.submitByName || '',
                }));
            }
        } catch (error) {
            handleHttpError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProductInfo = async (code: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/api/mobile/v1/activations/voucher/product-info?voucherCode=${code}`);
            if (response.data) {
                setProductInfo(response.data);
            }
        } catch (error) {
            handleHttpError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickDocument = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setForm({ ...form, invoiceFile: result.assets[0] });
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setForm({ ...form, purchaseDate: selectedDate });
        }
    };

    const handleSubmit = async () => {
        if (isInvoiceRequired && (!form.invoiceNo.trim() || !form.invoiceFile)) {
            Alert.alert('Error', 'Nomor Invoice dan File Invoice wajib diisi');
            return;
        }

        setIsLoading(true);
        try {
            // Adjust payload format based on actual API requirements
            const formData = new FormData();
            formData.append('voucherCode', voucherCode || '');
            if (activationId) formData.append('activationId', activationId);

            formData.append('fullname', form.fullname);
            formData.append('phone', form.phone);
            formData.append('email', form.email);
            formData.append('address', form.address);
            formData.append('store', form.store);
            formData.append('purchaseDate', format(form.purchaseDate, 'yyyy-MM-dd HH:mm:ss'));

            if (form.invoiceNo) {
                formData.append('invoiceNo', form.invoiceNo);
            }

            if (form.invoiceFile) {
                formData.append('invoiceFile', {
                    uri: form.invoiceFile.uri,
                    name: form.invoiceFile.fileName || 'invoice.jpg',
                    type: form.invoiceFile.mimeType || 'image/jpeg',
                } as any);
            }

            const response = await axiosInstance.post('/api/mobile/v1/activations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Sukses', 'Aktivasi garansi berhasil', [
                    { text: 'OK', onPress: () => router.navigate('/(tabs)/home') }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Gagal aktivasi garansi');
        } finally {
            setIsLoading(false);
        }
    };

    const isReadOnly = !!activationId;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Aktivasi Garansi',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Feather name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: {
                        fontFamily: 'sans-bold',
                        fontSize: 18,
                        color: colors.text,
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: colors.background,
                    }
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Input
                    label="Nomor Kupon"
                    value={voucherCode || productInfo?.voucherCode || ''}
                    editable={false}
                />

                {/* Section: Informasi Produk */}
                <Text style={styles.sectionTitle}>Informasi Produk</Text>

                <Input label="Nama Produk" value={productInfo?.productName || ''} editable={false} />
                <Input label="Nomor Serial" value={productInfo?.serialNo || ''} editable={false} />
                <Input label="Nomor Motor" value={productInfo?.motorNo || ''} editable={false} />
                <Input label="Nomor Frame" value={productInfo?.frameNo || ''} editable={false} />
                <Input label="Nomor Controller" value={productInfo?.controllerNo || ''} editable={false} />
                <Input label="Nomor Charger" value={productInfo?.chargerNo || ''} editable={false} />
                <Input label="Nomor Baterai" value={productInfo?.batteryNo || ''} editable={false} />
                <Input label="Tanggal QC" value={productInfo?.qcDate || ''} editable={false} />
                <Input label="Production Line" value={productInfo?.productionLine || ''} editable={false} />
                <Input label="Tanggal Produksi" value={formatDate(productInfo?.productionDate) || ''} editable={false} />
                <Input label="Tanggal Pengiriman" value={formatDate(productInfo?.deliveryDate) || ''} editable={false} />

                {/* Section: Informasi Toko / Pelanggan */}
                <Text style={styles.sectionTitle}>Informasi Toko / Pelanggan</Text>

                <Input
                    label="Nama Lengkap"
                    required={!isReadOnly}
                    value={form.fullname}
                    onChangeText={(text) => setForm({ ...form, fullname: text })}
                    editable={!isReadOnly}
                />
                <Input
                    label="Nomor Telepon"
                    required={!isReadOnly}
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    keyboardType="phone-pad"
                    editable={!isReadOnly}
                />
                <Input
                    label="Email"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isReadOnly}
                />
                <Input
                    label="Alamat"
                    required={!isReadOnly}
                    inputWrapperStyle={{ height: 100, alignItems: 'flex-start' }}
                    style={{ paddingTop: 12, height: 100 }}
                    multiline
                    textAlignVertical="top"
                    value={form.address}
                    onChangeText={(text) => setForm({ ...form, address: text })}
                    editable={!isReadOnly}
                />
                <Input
                    label="Toko"
                    value={form.store}
                    onChangeText={(text) => setForm({ ...form, store: text })}
                    editable={!isReadOnly}
                />

                {/* Section: Informasi Lainnya */}
                <Text style={styles.sectionTitle}>Informasi Lainnya</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tanggal Pembelian{!isReadOnly && <Text style={styles.asterisk}>*</Text>}</Text>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => !isReadOnly && setShowDatePicker(true)}
                        activeOpacity={isReadOnly ? 1 : 0.7}
                    >
                        <Text style={styles.datePickerText}>{format(form.purchaseDate, 'dd-MMM-yyyy, HH:mm')}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={form.purchaseDate}
                            mode="datetime"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                {isInvoiceRequired && (
                    <>
                        <Input
                            label="Nomor Invoice"
                            required={!isReadOnly}
                            value={form.invoiceNo}
                            onChangeText={(text) => setForm({ ...form, invoiceNo: text })}
                            editable={!isReadOnly}
                        />
                        <FileUpload
                            label="Invoice"
                            required={!isReadOnly}
                            value={form.invoiceFile?.fileName || form.invoiceFile?.name}
                            onPress={isReadOnly ? undefined : handlePickDocument}
                        />
                    </>
                )}

                {!isReadOnly && (
                    <Button
                        title="Klaim Garansi"
                        onPress={handleSubmit}
                        loading={isLoading}
                        style={styles.submitBtn}
                    />
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontFamily: 'sans-bold',
        fontSize: 16,
        color: '#E62129',
        marginTop: 16,
        marginBottom: 16,
    },
    submitBtn: {
        marginTop: 24,
        backgroundColor: '#00A63F',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#111',
        marginBottom: 8,
    },
    asterisk: {
        color: '#E62129',
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        height: 52,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    datePickerText: {
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#333',
    }
});
