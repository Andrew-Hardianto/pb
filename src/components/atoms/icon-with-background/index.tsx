import { Pressable } from "react-native";
import { SvgProps } from "react-native-svg";

interface IconWithBackgroundProps {
    icon: React.FC<SvgProps>;
    height: number;
    width: number;
    onPress: () => void;
}

function IconWithBackground({ icon: Icon, height, width, onPress }: Readonly<IconWithBackgroundProps>) {
    return (
        <Pressable
            android_ripple={{
                color: 'rgba(255,255,255,0.3)',
                borderless: true,
                radius: 24,
            }}
            style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
            })}
            onPress={onPress}
        >
            <Icon width={width} height={height} />
        </Pressable>
    )
}

export default IconWithBackground;