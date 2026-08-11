import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface FilterKlaimData {
    claimNo: string;
    couponCode: string;
    type: string;
    startDate: Date | null;
    endDate: Date | null;
}

interface FilterKlaimModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (data: FilterKlaimData) => void;
    initialData?: FilterKlaimData;
}

const FilterKlaimModal: React.FC<FilterKlaimModalProps> = ({ visible, onClose, onApply, initialData }) => {
    const [form, setForm] = useState<FilterKlaimData>(initialData || {
        claimNo: '',
        couponCode: '',
        type: '',
        startDate: null,
        endDate: null
    });

    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const pickerType = showPicker;
        setShowPicker(Platform.OS === 'ios' ? pickerType : null);

        if (selectedDate && pickerType) {
            if (pickerType === 'start') {
                setForm({ ...form, startDate: selectedDate });
            } else {
                setForm({ ...form, endDate: selectedDate });
            }
        }
    };

    const handleClear = () => {
        const cleared = { claimNo: '', couponCode: '', type: '', startDate: null, endDate: null };
        setForm(cleared);
        onApply(cleared);
        onClose();
    };

    const handleApply = () => {
        onApply(form);
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filter</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={24} color="#111" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        <Input
                            label="Nomor Klaim"
                            placeholder="Masukkan nomor klaim"
                            value={form.claimNo}
                            onChangeText={(val) => setForm({ ...form, claimNo: val })}
                        />

                        <Input
                            label="Kode Kupon"
                            placeholder="Masukkan kode kupon"
                            value={form.couponCode}
                            onChangeText={(val) => setForm({ ...form, couponCode: val })}
                        />

                        <View style={{ zIndex: 10 }}>
                            <Select
                                label="Tipe"
                                placeholder="Select an option"
                                value={form.type}
                                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                            />
                            {showTypeDropdown && (
                                <View style={styles.dropdownContainer}>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setForm({ ...form, type: 'Toko' });
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>Toko</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setForm({ ...form, type: 'Pembeli' });
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>Pembeli</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Pilih Tanggal</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker('start')}>
                                <Text style={[styles.dateText, !form.startDate && styles.datePlaceholder]}>
                                    {form.startDate ? format(form.startDate, 'dd MMM yyyy') : 'Mulai'}
                                </Text>
                                <Feather name="calendar" size={16} color="#666" />
                            </TouchableOpacity>

                            <Text style={styles.dash}>-</Text>

                            <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker('end')}>
                                <Text style={[styles.dateText, !form.endDate && styles.datePlaceholder]}>
                                    {form.endDate ? format(form.endDate, 'dd MMM yyyy') : 'Akhir'}
                                </Text>
                                <Feather name="calendar" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {showPicker && (
                            <DateTimePicker
                                value={showPicker === 'start' ? (form.startDate || new Date()) : (form.endDate || new Date())}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleClear}>
                            <Text style={styles.btnOutlineText}>Hapus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSolid]} onPress={handleApply}>
                            <Text style={styles.btnSolidText}>Terapkan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
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
    title: {
        fontSize: 16,
        fontFamily: 'sans-bold',
        color: '#111',
    },
    closeBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    label: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#111',
        marginBottom: 8,
    },
    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        marginTop: -15, // To pull it up closer to the select if needed, or adjust padding
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    dropdownItemText: {
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#111',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    dateText: {
        fontSize: 14,
        fontFamily: 'sans-medium',
        color: '#111',
    },
    datePlaceholder: {
        color: '#999',
    },
    dash: {
        marginHorizontal: 10,
        color: '#111',
        fontFamily: 'sans-bold',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    btn: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnOutline: {
        backgroundColor: '#FDEBEC',
    },
    btnOutlineText: {
        color: Colors.danger,
        fontFamily: 'sans-bold',
        fontSize: 14,
    },
    btnSolid: {
        backgroundColor: Colors.danger,
    },
    btnSolidText: {
        color: '#FFF',
        fontFamily: 'sans-bold',
        fontSize: 14,
    }
});

export default FilterKlaimModal;
