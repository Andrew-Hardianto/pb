import home from "@/assets/icon/tabbar/home.svg";
import message from "@/assets/icon/tabbar/message-question.svg";
import profile from "@/assets/icon/tabbar/profile.svg";
import star from "@/assets/icon/tabbar/star.svg";
import wallet from "@/assets/icon/tabbar/wallet.svg";

export const icons = {
    home,
    wallet,
    profile,
    star,
    message,
} as const;

export type IconKey = keyof typeof icons;