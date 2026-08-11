import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { InputResiModal } from '@/components/organisms/input-resi-modal';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { axiosInstance } from '@/lib/axiosInstance';
import { filterByCategory } from '@/services/main-service.service';
import { showPopup } from '@/stores/popupStore';
import { formatDate, formatDateTime } from '@/utils/date';
import { handleHttpError } from '@/utils/httpError';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getBadgeStyles = (status: string) => {
    switch (status) {
        case 'REQUESTED':
            return { bg: '#FFF6E7', text: '#D88500', label: 'Diproses' };
        case 'APPROVED':
            return { bg: '#EAFFEB', text: '#118518', label: 'Disetujui' };
        case 'FINISHED':
            return { bg: '#F2E7FF', text: '#6100D8', label: 'Selesai' };
        case 'SHIPPED_TO_SHOP':
            return { bg: '#EAEAEA', text: '#646464', label: 'Dikirim ke Toko' };
        case 'SHIPPED_TO_WAREHOUSE':
            return { bg: '#E8E9EB', text: '#19253F', label: 'Dikirim ke Gudang' };
        case 'REJECTED':
            return { bg: '#FFE8E9', text: '#ED1B24', label: 'Ditolak' };
        case 'CANCELED':
            return { bg: '#FFE8E9', text: '#ED1B24', label: 'Batal' };
        default:
            return { bg: '#E7F3FF', text: '#006CD8', label: status || '-' };
    }
};

export default function StatusKlaimDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors, isDarkMode } = useTheme();
    const [showResiModal, setShowResiModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['warranty-claim-detail', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/api/mobile/v1/warranty-claims/${id}`);
            let data = res.data?.data || res.data;
            data.listFotoProduct = filterByCategory(data.attachments, ["PRODUCT", "DETAIL", "FRAME"]);
            data.listFotoShop = filterByCategory(data.attachments, ["TO_SHOP_AWB"]);
            data.listFotoWarehouse = filterByCategory(data.attachments, ["TO_WAREHOUSE_AWB"]);
            return data;
        }
    });

    const renderField = (label: string, value: string | undefined | null) => (
        <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{value || '-'}</Text>
        </View>
    );

    const renderPhotos = (photos: any[]) => {
        if (!photos) return <Text style={[styles.fieldValue, { color: colors.text }]}>-</Text>;
        const photoArray = Array.isArray(photos) ? photos : [photos];
        if (photoArray.length === 0) return <Text style={[styles.fieldValue, { color: colors.text }]}>-</Text>;

        return (
            <View style={styles.photosRow}>
                {photoArray.map((item, index) => (
                    <Image key={index} source={{ uri: item?.path }} style={styles.photo} resizeMode="cover" />
                ))}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Detail Informasi</Text>
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    <Skeleton height={200} borderRadius={12} style={{ marginBottom: 20 }} />
                    <Skeleton height={300} borderRadius={12} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Detail Informasi</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={{ color: colors.text }}>Data tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const badge = getBadgeStyles(data.status);

    const handleSubmit = async (type: string) => {
        const featurePath = "warranty-claims";
        const actionPath = type === "Finish" ? "finish" : "cancel";

        const urlApi = `/api/mobile/v1/${featurePath}/${id}/${actionPath}`;

        setLoading(true);
        try {
            const payload = {};

            const response = await axiosInstance.post(urlApi, payload, {});

            if (response.status === 200 || response.status === 201) {
                showPopup({
                    type: 'success',
                    title: 'Sukses',
                    message: response.data.message || `Data berhasil diupdate`,
                    primaryButtonText: 'OK',
                    onPrimaryPress: () => router.back()
                });
            }
        } catch (error: any) {
            handleHttpError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Detail Informasi</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: isDarkMode ? colors.backgroundElement : '#FFF', borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' }]}>

                    {/* Informasi Umum */}
                    <Text style={styles.sectionTitle}>Informasi Umum</Text>
                    {renderField("Nomor Transaksi", data.requestNo)}
                    {renderField("Tanggal Klaim", formatDate(data.claimDate) || "-")}

                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Status</Text>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                    </View>

                    {renderField("Catatan", data.actionNotes)}
                    {renderField("Nomor Resi Ke Gudang", data.toWarehouseAwbNo)}
                    {renderField("Nama Ekspedisi Ke Gudang", data.toWarehouseShippingServiceName)}
                    {renderField("Tanggal Kirim Ke Gudang", data.toWarehouseAwbDate ? formatDate(data.toWarehouseAwbDate) : null)}

                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Foto</Text>
                        {renderPhotos(data.listFotoWarehouse || [])}
                    </View>

                    {renderField("Nomor Resi Ke Toko", data.toShopAwbNo)}
                    {renderField("Nama Ekspedisi Ke Toko", data.toShopShippingServiceName)}
                    {renderField("Tanggal Kirim Ke Toko", data.toShopAwbDate ? formatDate(data.toShopAwbDate) : null)}

                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Foto</Text>
                        {renderPhotos(data.listFotoShop || [])}
                    </View>

                    {/* Informasi Garansi */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Informasi Garansi</Text>
                    {renderField("Nomor Kupon", data.voucherCode)}
                    {renderField("Nomor Invoice", data.invoiceNo)}

                    {/* Informasi Produk */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Informasi Produk</Text>
                    {renderField("Nama Produk", data.productName || "-")}
                    {renderField("Nomor Serial", data.serialNo || "-")}
                    {renderField("Nomor Motor", data.motorNo || "-")}
                    {renderField("Nomor Frame", data.frameNo || "-")}
                    {renderField("Nomor Controller", data.controllerNo || "-")}
                    {renderField("Nomor Charger", data.chargerNo || "-")}
                    {renderField("Nomor Baterai", data.batteryNo || "-")}
                    {renderField("Tanggal QC", data.qcDate ? formatDate(data.qcDate) : null)}
                    {renderField("Production Line", data.productionLine || "-")}
                    {renderField("Tanggal Produksi", data.productionDate ? formatDate(data.productionDate) : null)}

                    {/* Informasi Kerusakan */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Informasi Kerusakan</Text>
                    {renderField("Nama Komponen", data.componentName)}
                    {renderField("Kendala", data.issue)}
                    {renderField("Penanganan", data.handling)}
                    {renderField("Detail", data.remarks)}
                    {renderField("Tanggal Kejadian", data.eventDate ? formatDateTime(data.eventDate) : null)}
                    {renderField("Pihak Terkait Kerusakan", data.personInCharge)}

                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Foto <Text style={{ color: '#E62129' }}>*</Text></Text>
                        {renderPhotos(data.listFotoProduct)}
                    </View>

                    {/* Informasi Pembeli */}
                    <View style={styles.divider} />
                    {data.shopType == "BUYER" && (
                        <>
                            <Text style={styles.sectionTitle}>Informasi Pembeli</Text>
                            {renderField("Nama Lengkap", data.buyerName)}
                            {renderField("Nomor Telepon", data.buyerPhone)}
                            {renderField("Email", data.buyerEmail)}
                            {renderField("Alamat", data.buyerAddress)}
                        </>
                    )}
                    {data.shopType != "BUYER" && (
                        <>
                            <Text style={styles.sectionTitle}>Informasi Toko</Text>
                            {renderField("Nama Toko", data.shopName)}
                            {renderField("Nomor Telepon", data.shopPhone)}
                            {renderField("Email", data.shopEmail)}
                            {renderField("Alamat", data.shopAddress)}
                        </>
                    )}
                </View>
                <View>
                    {data.status == "REQUESTED" && data.shopType != "BUYER" && (
                        <Button
                            title="Batalkan Klaim"
                            onPress={() => handleSubmit("Cancel")}
                            disabled={false}
                            style={styles.submitButton}
                        />
                    )}

                    {data.status == "SHIPPED_TO_SHOP" && data.shopType != "BUYER" && (
                        <Button
                            title="Selesai"
                            onPress={() => handleSubmit("Finish")}
                            disabled={false}
                            style={styles.submitButtonApproved}
                        />
                    )}

                    {data.status == "APPROVED" && data.shopType != "BUYER" && (
                        <Button
                            title="Input No Resi"
                            onPress={() => setShowResiModal(true)}
                            disabled={false}
                            style={styles.submitButtonShipped}
                        />
                    )}
                </View>
            </ScrollView>

            <InputResiModal
                visible={showResiModal}
                onClose={() => setShowResiModal(false)}
                id={id}
                menuName="Klaim Garansi"
                onSuccess={() => {
                    // Refresh data or redirect
                    router.back();
                }}
            />
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'sans-bold',
        marginLeft: 15,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 20,
    },
    sectionTitle: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#E62129',
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontFamily: 'sans-regular',
        fontSize: 12,
        marginBottom: 4,
    },
    fieldValue: {
        fontFamily: 'sans-bold',
        fontSize: 14,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: 'sans-bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EAEAEA',
        marginVertical: 20,
    },
    photosRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 5,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    submitButton: {
        marginTop: 10,
        backgroundColor: Colors.danger,
    },
    submitButtonApproved: {
        marginTop: 10,
        backgroundColor: Colors.success,
    },
    submitButtonShipped: {
        marginTop: 10,
        backgroundColor: Colors.primary,
    },
});
