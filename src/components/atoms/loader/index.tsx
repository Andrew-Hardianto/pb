import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface LoaderProps {
    visible: boolean;
    message: string | null;
}

function Loader({ visible, message }: Readonly<LoaderProps>) {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#444" />
                    <Text style={styles.text}>{message ?? "Loading..."}</Text>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        paddingVertical: 25,
        paddingHorizontal: 30,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        marginLeft: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default Loader;