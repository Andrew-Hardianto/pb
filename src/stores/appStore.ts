import { create } from 'zustand';

interface AppStore {
    loading: boolean;
    loadingMessage?: string;
    loadingLogout: boolean;
    countingApproval: number;
    countExit: number;
    isRootOpened: boolean;
    isOwner: boolean;
    isNative: boolean;
    isFaceId: boolean;
    isHaveBiometric: boolean;
    isSetBiometric: boolean;
    sessionState: any;
    currentURL: string;

    // === Actions ===
    setLoading: (loading: boolean, message?: string) => void;
    setLoadingLogout: (value: boolean) => void;
    setCountingApproval: (value: number) => void;
    setCountExit: (value: number) => void;
    setIsOwner: (value: boolean) => void;
    setCurrentURL: (url: string) => void;
    setSessionState: (state: any) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    loading: false,
    loadingMessage: undefined,
    loadingLogout: false,
    countingApproval: 0,
    countExit: 0,
    isRootOpened: false,
    isOwner: false,
    isNative: false,
    isFaceId: false,
    isHaveBiometric: false,
    isSetBiometric: false,
    sessionState: null,
    currentURL: '',

    setLoading: (loading, message) => set({ loading, loadingMessage: message }),
    setLoadingLogout: (loadingLogout) => set({ loadingLogout }),
    setCountingApproval: (countingApproval) => set({ countingApproval }),
    setCountExit: (countExit) => set({ countExit }),
    setIsOwner: (isOwner) => set({ isOwner }),
    setCurrentURL: (currentURL) => set({ currentURL }),
    setSessionState: (sessionState) => set({ sessionState }),
}));