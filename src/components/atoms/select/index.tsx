import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface SelectProps {
    label?: string;
    required?: boolean;
    value?: string;
    placeholder?: string;
    error?: string | boolean | null;
    onPress?: () => void;
    inputWrapperStyle?: StyleProp<ViewStyle>;
}

export const Select: React.FC<SelectProps> = ({
    label,
    required,
    value,
    placeholder,
    error,
    onPress,
    inputWrapperStyle,
}) => {
    return (
        <View style={styles.inputGroup}>
            {label && (
                <Text style={styles.inputLabel}>
                    {label}{required && <Text style={styles.asterisk}>*</Text>}
                </Text>
            )}
            <TouchableOpacity
                style={[styles.inputWrapper, !!error && styles.inputError, inputWrapperStyle]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Text style={[styles.input, { color: value ? '#111' : '#999' }]}>
                    {value || placeholder || 'Pilih'}
                </Text>
                <Feather name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {!!error && typeof error === 'string' && (
                <Text style={styles.errorText}>{error}</Text>
            )}
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
        lineHeight: 52,
    },
});
