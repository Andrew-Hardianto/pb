import { router } from 'expo-router';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Dashboard: undefined;
};

export function navigate(name: keyof RootStackParamList, params?: any) {
    if (name === 'Login') {
        router.push('/(auth)/login');
    } else if (name === 'Home') {
        router.push('/(tabs)/home');
    } else {
        router.push(`/${(name as string).toLowerCase()}` as any);
    }
}

/** Reset stack ke root, setara navCtrl.navigateRoot() */
export function navigateRoot(name: string) {
    if (name === 'Login') {
        router.replace('/(auth)/login');
    } else {
        router.replace(`/${name.toLowerCase()}` as any);
    }
}