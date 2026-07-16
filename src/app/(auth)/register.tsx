import { Button } from '@/components/atoms/button';
import { FileUpload } from '@/components/atoms/file-upload';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { SearchableModal } from '@/components/molecules/searchable-modal';
import { useLookupData } from '@/hooks/useLookupData';
import { postUrlApi } from '@/services/http.service';
import { dismissLoading, presentLoading } from '@/services/main-service.service';
import { usePopupStore } from '@/stores/popupStore';
import { handleHttpError } from '@/utils/httpError';
import { validateEmail, validatePhone } from '@/utils/validation';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const popup = usePopupStore();

    const [idPengguna, setIdPengguna] = useState('');
    const [namaPemilik, setNamaPemilik] = useState('');
    const [namaToko, setNamaToko] = useState('');
    const [email, setEmail] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [provinsi, setProvinsi] = useState('');
    const [kota, setKota] = useState('');
    const [alamat, setAlamat] = useState('');
    const [fotoToko, setFotoToko] = useState<any>(null);
    const [fotoKtp, setFotoKtp] = useState<any>(null);
    const [nomorKtp, setNomorKtp] = useState('');
    const [fotoNpwp, setFotoNpwp] = useState<any>(null);
    const [nomorNpwp, setNomorNpwp] = useState('');

    const [modalProvinsiVisible, setModalProvinsiVisible] = useState(false);
    const [modalKotaVisible, setModalKotaVisible] = useState(false);

    const [kecamatan, setKecamatan] = useState('');
    const [modalKecamatanVisible, setModalKecamatanVisible] = useState(false);

    const [kelurahan, setKelurahan] = useState('');
    const [modalKelurahanVisible, setModalKelurahanVisible] = useState(false);

    const [kodePos, setKodePos] = useState('');
    const [modalKodePosVisible, setModalKodePosVisible] = useState(false);

    const { data: provinces } = useLookupData({ endpoint: '/api/public/v1/lookup/provinces' });
    const { data: cities } = useLookupData({ endpoint: provinsi ? `/api/public/v1/lookup/cities?province=${encodeURIComponent(provinsi)}` : null });
    const { data: districts } = useLookupData({ endpoint: kota ? `/api/public/v1/lookup/districts?city=${encodeURIComponent(kota)}` : null });
    const { data: subDistricts } = useLookupData({ endpoint: kecamatan ? `/api/public/v1/lookup/sub-districts?district=${encodeURIComponent(kecamatan)}` : null });
    const { data: postalCodes } = useLookupData({ endpoint: kelurahan ? `/api/public/v1/lookup/postal-codes?province=${encodeURIComponent(provinsi)}&city=${encodeURIComponent(kota)}&district=${encodeURIComponent(kecamatan)}&subdistrict=${encodeURIComponent(kelurahan)}` : null });

    const getProvName = (p: any) => p?.name || p?.prov_name || p?.provinsi || (typeof p === 'string' ? p : '');
    const getCityName = (c: any) => c?.name || c?.city_name || c?.kota || (typeof c === 'string' ? c : '');
    const getDistrictName = (d: any) => d?.name || d?.district_name || d?.kecamatan || (typeof d === 'string' ? d : '');
    const getSubDistrictName = (s: any) => s?.name || s?.subdistrict_name || s?.kelurahan || (typeof s === 'string' ? s : '');
    const getPostalCode = (p: any) => (p?.postal_code || p?.kodepos || p?.name || (typeof p === 'string' ? p : '')).toString();

    // Validations
    const isEmailValid = validateEmail(email) || email === '';
    const isPhoneValid = validatePhone(nomorTelepon) || nomorTelepon === '';

    const isFormValid =
        idPengguna.trim() !== '' &&
        namaPemilik.trim() !== '' &&
        namaToko.trim() !== '' &&
        email.trim() !== '' && validateEmail(email) &&
        nomorTelepon.trim() !== '' && validatePhone(nomorTelepon) &&
        provinsi.trim() !== '' &&
        kota.trim() !== '' &&
        kecamatan.trim() !== '' &&
        kelurahan.trim() !== '' &&
        kodePos.trim() !== '' &&
        alamat.trim() !== '' &&
        fotoToko !== null &&
        fotoKtp !== null &&
        nomorKtp.trim() !== '';

    // Upload handlers
    const handleUpload = async (setter: React.Dispatch<React.SetStateAction<any>>, category: string) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const uri = asset.uri;
                const filename = asset.fileName || uri.split('/').pop() || 'image.jpg';
                setter({
                    img: uri,
                    size: asset.fileSize || 0,
                    path: uri,
                    name: filename,
                    fileType: asset.mimeType || 'image/jpeg',
                    file: asset
                });
            }
        } catch (error) {
            console.log("Error picking image:", error);
        }
    };

    const submitForm = async () => {
        try {
            await presentLoading('Mengirim data...');
            const payload: any = {
                name: namaToko,
                username: idPengguna,
                address: alamat,
                email: email,
                province: provinsi,
                city: kota,
                district: kecamatan,
                subDistrict: kelurahan,
                zipCode: kodePos,
                ownerFullName: namaPemilik,
                nik: nomorKtp,
                npwp: nomorNpwp,
                phoneNumber: nomorTelepon
            };

            const formData = new FormData();

            if (fotoKtp) {
                formData.append("nik", {
                    uri: fotoKtp.path,
                    name: fotoKtp.name,
                    type: fotoKtp.fileType
                } as any);
            }

            if (fotoNpwp) {
                formData.append("npwp", {
                    uri: fotoNpwp.path,
                    name: fotoNpwp.name,
                    type: fotoNpwp.fileType
                } as any);
            }

            if (fotoToko) {
                formData.append("shop", {
                    uri: fotoToko.path,
                    name: fotoToko.name,
                    type: fotoToko.fileType
                } as any);
            }

            formData.append("request", JSON.stringify(payload));

            await postUrlApi('/api/public/v1/shop-registrations', formData);

            popup.show({
                type: 'success',
                title: 'Berhasil',
                message: 'Registrasi toko berhasil dikirim.',
                primaryButtonText: 'OK',
                onPrimaryPress: () => router.back()
            });

        } catch (error) {
            console.log(error);

            handleHttpError(error);
        } finally {
            await dismissLoading();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pengguna Baru</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                    {/* ID Pengguna */}
                    <Input
                        label="ID Pengguna (Username)"
                        required
                        value={idPengguna}
                        onChangeText={setIdPengguna}
                    />

                    {/* Nama Pemilik */}
                    <Input
                        label="Nama Lengkap Pemilik Toko"
                        required
                        value={namaPemilik}
                        onChangeText={setNamaPemilik}
                    />

                    {/* Nama Toko */}
                    <Input
                        label="Nama Toko"
                        required
                        value={namaToko}
                        onChangeText={setNamaToko}
                    />

                    {/* Email */}
                    <Input
                        label="Email"
                        required
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        error={!isEmailValid && email !== '' ? 'Format email tidak valid' : null}
                    />

                    {/* Nomor Telepon */}
                    <Input
                        label="Nomor Telepon"
                        required
                        keyboardType="numeric"
                        value={nomorTelepon}
                        onChangeText={(text) => {
                            const formatted = text.replace(/[^0-9]/g, '');
                            setNomorTelepon(formatted);
                        }}
                        error={!isPhoneValid && nomorTelepon !== '' ? 'Nomor telepon harus 10 - 15 angka' : null}
                    />

                    {/* Provinsi (Searchable Select) */}
                    <Select
                        label="Provinsi"
                        required
                        value={provinsi}
                        placeholder="Pilih Provinsi"
                        onPress={() => setModalProvinsiVisible(true)}
                    />

                    {/* Kota (Searchable Select) */}
                    {provinsi !== '' && (
                        <Select
                            label="Kota"
                            required
                            value={kota}
                            placeholder="Pilih Kota"
                            onPress={() => setModalKotaVisible(true)}
                        />
                    )}

                    {/* Kecamatan (Searchable Select) */}
                    {kota !== '' && (
                        <Select
                            label="Kecamatan"
                            required
                            value={kecamatan}
                            placeholder="Pilih Kecamatan"
                            onPress={() => setModalKecamatanVisible(true)}
                        />
                    )}

                    {/* Kelurahan (Searchable Select) */}
                    {kecamatan !== '' && (
                        <Select
                            label="Kelurahan"
                            required
                            value={kelurahan}
                            placeholder="Pilih Kelurahan"
                            onPress={() => setModalKelurahanVisible(true)}
                        />
                    )}

                    {/* Kode Pos (Searchable Select) */}
                    {kelurahan !== '' && (
                        <Select
                            label="Kode Pos"
                            required
                            value={kodePos}
                            placeholder="Pilih Kode Pos"
                            onPress={() => setModalKodePosVisible(true)}
                        />
                    )}

                    {/* Alamat */}
                    <Input
                        label="Alamat"
                        required
                        inputWrapperStyle={{ height: 100, alignItems: 'flex-start' }}
                        style={{ paddingTop: 12, height: 100 }}
                        multiline
                        textAlignVertical="top"
                        value={alamat}
                        onChangeText={setAlamat}
                    />

                    {/* Foto Toko */}
                    <FileUpload
                        label="Foto Toko"
                        required
                        value={fotoToko?.name || ''}
                        helperText="Format PNG , jpeg maks. 5MB"
                        onPress={() => handleUpload(setFotoToko, 'TOKO')}
                    />

                    <Text style={styles.sectionTitle}>Informasi KTP</Text>

                    {/* Foto KTP */}
                    <FileUpload
                        label="Foto KTP"
                        required
                        value={fotoKtp?.name || ''}
                        helperText="Format PNG , jpeg maks. 5MB"
                        onPress={() => handleUpload(setFotoKtp, 'KTP')}
                    />

                    {/* Nomor KTP */}
                    <Input
                        label="Nomor KTP"
                        required
                        keyboardType="numeric"
                        value={nomorKtp}
                        onChangeText={setNomorKtp}
                    />

                    <Text style={styles.sectionTitle}>Informasi NPWP</Text>

                    {/* Foto NPWP */}
                    <FileUpload
                        label="Foto NPWP"
                        value={fotoNpwp?.name || ''}
                        helperText="Format PNG , jpeg maks. 5MB"
                        onPress={() => handleUpload(setFotoNpwp, 'NPWP')}
                    />

                    {/* Nomor NPWP */}
                    <Input
                        label="Nomor NPWP"
                        keyboardType="numeric"
                        value={nomorNpwp}
                        onChangeText={setNomorNpwp}
                    />

                    <Button
                        title="Submit"
                        disabled={!isFormValid}
                        style={{ marginTop: 16 }}
                        onPress={() => {
                            popup.show({
                                type: 'confirm',
                                title: 'Konfirmasi',
                                message: 'Mohon pastikan semua data yang Anda masukkan sudah sesuai sebelum dikirim.',
                                primaryButtonText: 'Lanjutkan',
                                secondaryButtonText: 'Batalkan',
                                onPrimaryPress: async () => {
                                    await submitForm();
                                }
                            });
                        }}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal Provinsi */}
            <SearchableModal
                visible={modalProvinsiVisible}
                title="Pilih Provinsi"
                placeholder="Cari provinsi..."
                data={provinces}
                value={provinsi}
                getLabel={getProvName}
                onClose={() => setModalProvinsiVisible(false)}
                onSelect={(val) => {
                    setProvinsi(val);
                    setKota('');
                    setKecamatan('');
                    setKelurahan('');
                    setKodePos('');
                }}
            />

            {/* Modal Kota */}
            <SearchableModal
                visible={modalKotaVisible}
                title="Pilih Kota"
                placeholder="Cari kota..."
                data={cities}
                value={kota}
                getLabel={getCityName}
                onClose={() => setModalKotaVisible(false)}
                onSelect={(val) => {
                    setKota(val);
                    setKecamatan('');
                    setKelurahan('');
                    setKodePos('');
                }}
            />

            {/* Modal Kecamatan */}
            <SearchableModal
                visible={modalKecamatanVisible}
                title="Pilih Kecamatan"
                placeholder="Cari kecamatan..."
                data={districts}
                value={kecamatan}
                getLabel={getDistrictName}
                onClose={() => setModalKecamatanVisible(false)}
                onSelect={(val) => {
                    setKecamatan(val);
                    setKelurahan('');
                    setKodePos('');
                }}
            />

            {/* Modal Kelurahan */}
            <SearchableModal
                visible={modalKelurahanVisible}
                title="Pilih Kelurahan"
                placeholder="Cari kelurahan..."
                data={subDistricts}
                value={kelurahan}
                getLabel={getSubDistrictName}
                onClose={() => setModalKelurahanVisible(false)}
                onSelect={(val) => {
                    setKelurahan(val);
                    setKodePos('');
                }}
            />

            {/* Modal Kode Pos */}
            <SearchableModal
                visible={modalKodePosVisible}
                title="Pilih Kode Pos"
                placeholder="Cari kode pos..."
                data={postalCodes}
                value={kodePos}
                getLabel={getPostalCode}
                onClose={() => setModalKodePosVisible(false)}
                onSelect={(val) => setKodePos(val)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'sans-medium',
        color: '#111',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        height: 52,
        paddingHorizontal: 16,
    },
    inputError: {
        borderColor: '#E62129',
    },
    errorText: {
        color: '#E62129',
        fontSize: 12,
        marginTop: 4,
    },
    input: {
        flex: 1,
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#111',
        height: '100%',
    },
    uploadWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        height: 52,
        paddingHorizontal: 8,
    },
    uploadIconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#FDEBEC',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    uploadText: {
        flex: 1,
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#999',
    },
    helperText: {
        fontSize: 12,
        color: '#333',
        marginTop: 8,
    },
    sectionTitle: {
        fontFamily: 'sans-medium',
        fontSize: 14,
        color: '#E62129',
        marginTop: 8,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#E62129',
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        fontFamily: 'sans-bold',
        fontSize: 16,
        color: '#FFFFFF',
    },

});
