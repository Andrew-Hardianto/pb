import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface SearchableModalProps {
    visible: boolean;
    title: string;
    placeholder?: string;
    data: any[];
    value: string;
    onClose: () => void;
    onSelect: (value: string) => void;
    getLabel: (item: any) => string;
}

export const SearchableModal: React.FC<SearchableModalProps> = ({
    visible,
    title,
    placeholder = 'Cari...',
    data,
    value,
    onClose,
    onSelect,
    getLabel
}) => {
    const [searchText, setSearchText] = useState('');

    const filteredData = data.filter(item => 
        getLabel(item).toLowerCase().includes(searchText.toLowerCase())
    );

    const handleClose = () => {
        setSearchText('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Feather name="x" size={24} color="#111" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => getLabel(item) + index}
                        renderItem={({ item }) => {
                            const label = getLabel(item);
                            return (
                                <TouchableOpacity
                                    style={styles.provinceItem}
                                    onPress={() => {
                                        onSelect(label);
                                        handleClose();
                                    }}
                                >
                                    <Text style={styles.provinceItemText}>{label}</Text>
                                    {value === label && (
                                        <Feather name="check" size={20} color="#E62129" />
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'sans-bold',
        color: '#111',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: 'sans-regular',
        fontSize: 14,
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    provinceItemText: {
        fontSize: 16,
        fontFamily: 'sans-regular',
        color: '#333',
    },
});
