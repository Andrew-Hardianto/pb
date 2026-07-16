import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
    title: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
    title,
    style,
    textStyle,
    disabled,
    variant = 'primary',
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' && styles.primaryButton,
                disabled && styles.disabledButton,
                style
            ]}
            disabled={disabled}
            activeOpacity={0.7}
            {...props}
        >
            <Text
                style={[
                    styles.buttonText,
                    variant === 'primary' && styles.primaryButtonText,
                    disabled && styles.disabledButtonText,
                    textStyle
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: '#E62129',
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
    },
    buttonText: {
        fontFamily: 'sans-bold',
        fontSize: 16,
    },
    primaryButtonText: {
        color: '#FFFFFF',
    },
    disabledButtonText: {
        color: '#666666',
    },
});
