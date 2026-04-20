import { icons } from "./icons";

interface AppTab {
    name: string;
    title: string;
    icon: string;
}

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "garansi", title: "Garansi", icon: icons.wallet },
    { name: "poin", title: "Poin", icon: icons.activity },
    { name: "bantuan", title: "Bantuan", icon: icons.setting },
    { name: "profile", title: "Profile", icon: icons.setting },
];