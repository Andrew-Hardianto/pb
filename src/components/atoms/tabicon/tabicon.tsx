import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from "react-native-svg";

interface TabIconProps {
    icon: React.FC<SvgProps>;
    focused: boolean;
    label: string;
    size?: number;
}

const TabIcon = ({ icon: Icon, focused, label, size = 22 }: TabIconProps) => {
    return (
        <View style={[styles.tabItem, focused && styles.tabItemActive]}>
            <Icon
                width={size}
                height={size}
                color="#FFFFFF"
            />
            {focused ? <Text style={styles.tabLabel} >{label}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 40,
        borderRadius: 8,
        gap: 10,
    },
    tabItemActive: {
        backgroundColor: Colors.danger,
    },
    tabLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TabIcon;