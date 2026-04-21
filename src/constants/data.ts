import { ImageSourcePropType } from "react-native";
import { SvgProps } from "react-native-svg";
import { icons } from "./icons";

interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType | React.FC<SvgProps>; // depends on how you handle SVG
}

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "garansi", title: "Garansi", icon: icons.wallet },
    { name: "poin", title: "Poin", icon: icons.star },
    { name: "bantuan", title: "Bantuan", icon: icons.message },
    { name: "profile", title: "Profile", icon: icons.profile },
];