import UserSetting from '@/assets/icon/general/user-add.svg';
import IconWithBackground from '@/components/atoms/icon-with-background';
import ImageProfile from '@/components/atoms/image-profile';
import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeHeader = ({ profile }: any) => {

    const goToUserSetting = () => {

    }

    return (
        <View style={styles.card}>
            <View style={styles.rowProfile}>
                <View style={styles.rowImage}>
                    <ImageProfile width={43} height={43} src={null} />
                    <View style={styles.colUsername}>
                        <Text style={Colors.textBold}>Da</Text>
                        <Text style={Colors.textRegular}>Test</Text>
                    </View>
                </View>
                <View >
                    <IconWithBackground width={20} height={20} onPress={goToUserSetting} icon={UserSetting} />
                    <IconWithBackground width={20} height={20} onPress={goToUserSetting} icon={UserSetting} />
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderBottomRightRadius: 16,
        borderBottomLeftRadius: 16,
        backgroundColor: "#FFF",
        height: 300,
        padding: 20,
    },
    rowProfile: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    colUsername: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2
    },
    rowImage: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 10
    }
});

export default HomeHeader;
