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
        height: 40,
        borderRadius: 20,
    },
    tabItemActive: {
        backgroundColor: Colors.danger,
        paddingHorizontal: 16,
        // Using minWidth or fixed width prevents the flex parent from squishing the text
        minWidth: 100, 
    },
    tabLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        flexShrink: 0,
    },
});

export default TabIcon;