import { SvgProps } from "react-native-svg";
import { icons } from "./icons";

interface AppTab {
    name: string;
    title: string;
    icon: React.FC<SvgProps>; // depends on how you handle SVG
}

export const tabs: AppTab[] = [
    { name: "home", title: "Home", icon: icons.home },
    { name: "garansi", title: "Garansi", icon: icons.wallet },
    { name: "poin", title: "Poin", icon: icons.star },
    { name: "bantuan", title: "Bantuan", icon: icons.message },
    { name: "profile", title: "Profile", icon: icons.profile },
];

export const COLORS = [
    "#FF757D", "#52EED2", "#FF6996", "#1AD4D4", "#FF7AB2",
    "#0FEDFB", "#FF8933", "#3BCAF8", "#FFB74A", "#3AA1FF",
    "#F8D042", "#3969E4", "#EED496", "#9AAFFB", "#DEB792",
    "#C4B6ED", "#6AEE8F", "#9A7EEC", "#0AD98E", "#E49FEA",
];

export const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
];

export const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const SHORT_MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
];

export const GLOBAL_REGEX = {
    regexEmail:
        "[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})",
    regexNumeric: "[0-9]*(\\.[0-9]{1,2})?$",
    regexNumericKK: "[0-9]{16,16}",
    regexNumericNPWP: "[0-9]{15,15}",
    regexNumericBankAccount: "[0-9]{13,13}",
    regexAlphaNumeric: "[a-zA-Z,.0-9-/ ]*",
    regexAlphabetical: "[a-zA-Z ]*",
    regexMonthInYear: "(^0?[1-9]$)|(^1[0-2]$)",
    regexStrongPassword:
        "^(?=.*[A-Z])(?=.*[#?!@$%^&*-])(?=.*[0-9])(?=.*[a-z]).{8,}$",
    regexGPA: "/^[0-4][.][0-9][0-9]$/",
};

// Obfuscated storage keys (sama dengan aslinya)
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'SXNIUDH1WJ',
    REFRESH_TOKEN: 'GLA6F07C76',
    AUTHORITIES_TOKEN: 'MR1LPVSM5I',
    PROFILE: 'WBMJ23V89Y',
    FINGERPRINT_LOGIN_DATA: 'K3CYHQFYIW',
    IS_SETUP_BIOMETRIC: 'G3BP4J66UD',
    DARK_MODE: 'PCL75YWWDB',
    I9WJ1B85A8: 'I9WJ1B85A8',
    TENANT_ID: 'NHAGVR3C8N',
    FORGOT_PASSWORD: 'PPB5CSW709',
    REMEMBER_ME: 'RM8ME3K2L1',
} as const;
