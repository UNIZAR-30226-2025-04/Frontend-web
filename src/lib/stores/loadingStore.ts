import { writable } from 'svelte/store';

interface LoadingState {
    isLoading: boolean;
    message: string;
}

const createLoadingStore = () => {
    const { subscribe, update, set } = writable<LoadingState>({
        isLoading: false,
        message: 'Cargando...'
    });

    return {
        subscribe,
        startLoading: (message: string = 'Cargando...') => update(state => ({ isLoading: true, message })),
        stopLoading: () => update(state => ({ ...state, isLoading: false })),
        reset: () => set({ isLoading: false, message: 'Cargando...' })
    };
};

export const loadingStore = createLoadingStore();