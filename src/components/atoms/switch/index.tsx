import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Easing } from 'react-native';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeTrackColor?: string;
    inactiveTrackColor?: string;
    thumbColor?: string;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onValueChange,
    activeTrackColor = '#E62129',
    inactiveTrackColor = '#E2E6EC',
    thumbColor = '#FFFFFF',
}) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22] // thumb width is 26, track width is 50. 50 - 26 - 2 = 22
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveTrackColor, activeTrackColor]
    });

    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => onValueChange(!value)}
        >
            <Animated.View style={[styles.track, { backgroundColor }]}>
                <Animated.View 
                    style={[
                        styles.thumb, 
                        { 
                            backgroundColor: thumbColor,
                            transform: [{ translateX }]
                        }
                    ]} 
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
    },
    thumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    }
});
