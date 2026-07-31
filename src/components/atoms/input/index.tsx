import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface InputProps extends TextInputProps {
    label?: string;
    required?: boolean;
    error?: string | boolean | null;
    inputWrapperStyle?: StyleProp<ViewStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    required,
    error,
    inputWrapperStyle,
    leftIcon,
    rightIcon,
    style,
    ...props
}) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <View style={styles.inputGroup}>
            {label && (
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {label}{required && <Text style={styles.asterisk}>*</Text>}
                </Text>
            )}
            <View style={[
                styles.inputWrapper, 
                { backgroundColor: colors.backgroundElement, borderColor: isDarkMode ? colors.backgroundElement : '#EAEAEA' },
                !!error && styles.inputError, 
                inputWrapperStyle
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, { color: colors.text }, style]}
                    placeholderTextColor={colors.textSecondary}
                    {...props}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
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
    leftIcon: {
        marginRight: 12,
    },
    rightIcon: {
        marginLeft: 12,
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
});
