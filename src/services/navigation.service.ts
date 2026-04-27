import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Dashboard: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: object) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as any, params as any);
    }
}

/** Reset stack ke root, setara navCtrl.navigateRoot() */
export function navigateRoot(name: string) {
    if (navigationRef.isReady()) {
        navigationRef.resetRoot({
            index: 0,
            routes: [{ name }],
        });
    }
}