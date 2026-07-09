import { usePopupStore } from '@/stores/popupStore';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GlobalPopup() {
    const popup = usePopupStore();

    if (!popup.isVisible) return null;

    const renderIcon = () => {
        switch (popup.type) {
            case 'success':
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="check" size={32} color="#E62129" />
                    </View>
                );
            case 'error':
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="x" size={32} color="#E62129" />
                    </View>
                );
            case 'confirm':
                // Confirm in design has no icon, but we can return null or an alert icon
                return null;
            default:
                return null;
        }
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={popup.isVisible}
            onRequestClose={popup.hide}
        >
            <View style={styles.overlay}>
                <View style={styles.contentContainer}>
                    {renderIcon()}

                    <Text style={styles.title}>{popup.title}</Text>
                    <Text style={styles.message}>{popup.message}</Text>

                    {popup.type === 'confirm' ? (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={() => {
                                    if (popup.onSecondaryPress) popup.onSecondaryPress();
                                    popup.hide();
                                }}
                            >
                                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                    {popup.secondaryButtonText || 'Batal'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={() => {
                                    if (popup.onPrimaryPress) popup.onPrimaryPress();
                                    popup.hide();
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    {popup.primaryButtonText || 'Lanjutkan'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#E62129', width: '100%' }]}
                            onPress={() => {
                                if (popup.onPrimaryPress) popup.onPrimaryPress();
                                popup.hide();
                            }}
                        >
                            <Text style={styles.buttonText}>
                                {popup.primaryButtonText || 'Kembali'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FDEBEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 6,
        borderColor: '#F9D1D4',
    },
    errorBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#E62129',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FDEBEC',
    },
    title: {
        fontFamily: 'sans-bold',
        fontSize: 18,
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontFamily: 'sans-regular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#E62129',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#FDEBEC',
    },
    buttonText: {
        fontFamily: 'sans-bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    secondaryButtonText: {
        color: '#E62129',
    },
});
