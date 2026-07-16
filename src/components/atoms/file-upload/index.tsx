import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface FileUploadProps {
    label?: string;
    required?: boolean;
    value?: string | null;
    placeholder?: string;
    helperText?: string;
    onPress?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    required,
    value,
    placeholder = 'No file chosen',
    helperText,
    onPress,
}) => {
    return (
        <View style={styles.inputGroup}>
            {label && (
                <Text style={styles.inputLabel}>
                    {label}{required && <Text style={styles.asterisk}>*</Text>}
                </Text>
            )}
            <TouchableOpacity style={styles.uploadWrapper} onPress={onPress}>
                <View style={styles.uploadIconContainer}>
                    <Feather name="upload" size={20} color="#E62129" />
                </View>
                <Text style={styles.uploadText}>{value || placeholder}</Text>
            </TouchableOpacity>
            {helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
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
});
