import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface TermItem {
    id: string;
    sequenceNo: number;
    termType: string;
    remark: string;
    status: string;
}

interface Props {
    visible: boolean;
    data: TermItem[] | any;
    onSubmit: () => Promise<void>;
}

const TermsConditionsModal: React.FC<Props> = ({ visible, data, onSubmit }) => {
    const { width } = useWindowDimensions();
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const terms: TermItem[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Terms and Conditions</Text>

                    <View style={styles.scrollContainer}>
                        <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
                            {terms.length > 0 ? (
                                terms.map((item, index) => (
                                    <View key={item.id || index.toString()} style={styles.termItem}>
                                        <Text style={styles.termTitle}>{item.termType}</Text>
                                        <Text style={styles.termRemark}>{item.remark}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Memuat syarat dan ketentuan...</Text>
                            )}
                        </ScrollView>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setIsChecked(!isChecked)}
                            activeOpacity={0.7}
                        >
                            <Feather
                                name={isChecked ? "check-square" : "square"}
                                size={20}
                                color={isChecked ? Colors.danger : "#666"}
                            />
                            <Text style={styles.checkboxText}>Saya telah membaca dan menyetujui Syarat & Ketentuan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, (!isChecked || isLoading) && styles.submitButtonDisabled]}
                            disabled={!isChecked || isLoading}
                            onPress={async () => {
                                setIsLoading(true);
                                try {
                                    await onSubmit();
                                    setIsChecked(false);
                                } catch (e) {
                                    // Handle error if needed
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '100%',
        maxHeight: '80%',
        paddingVertical: 20,
        overflow: 'hidden',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 15,
        color: '#000',
    },
    scrollContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EEEEEE',
    },
    scrollContent: {
        padding: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 13,
        color: '#000',
        fontWeight: '600',
        flex: 1,
    },
    submitButton: {
        backgroundColor: Colors.danger,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    termItem: {
        marginBottom: 16,
    },
    termTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 6,
    },
    termRemark: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
    emptyText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default TermsConditionsModal;
