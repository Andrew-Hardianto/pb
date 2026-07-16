import { create } from 'zustand';

export type PopupType = 'success' | 'error' | 'confirm';

export interface PopupState {
    isVisible: boolean;
    type: PopupType;
    title: string;
    message: string;
    primaryButtonText: string;
    secondaryButtonText?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    
    // Actions
    show: (options: Omit<PopupState, 'isVisible' | 'show' | 'hide'>) => void;
    hide: () => void;
}

export const usePopupStore = create<PopupState>((set) => ({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
    primaryButtonText: 'OK',

    show: (options) => set({ 
        onPrimaryPress: undefined,
        onSecondaryPress: undefined,
        secondaryButtonText: undefined,
        ...options, 
        isVisible: true 
    }),
    hide: () => set({ isVisible: false }),
}));

// Global helper functions to use outside of React components
export const showPopup = (options: Omit<PopupState, 'isVisible' | 'show' | 'hide'>) => {
    usePopupStore.getState().show(options);
};

export const hidePopup = () => {
    usePopupStore.getState().hide();
};
