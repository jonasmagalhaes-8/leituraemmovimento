// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reading_app_state';

export const saveReadingState = async (state: {
    texto: string;
    currentIndex: number;
    speed: number;
    words: string[];
    isReading: boolean;
}) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('✅ Estado salvo com sucesso!');
    } catch (error) {
        console.log('❌ Erro ao salvar:', error);
    }
};

export const loadReadingState = async () => {
    try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
        console.log('❌ Erro ao carregar:', error);
        return null;
    }
};

export const clearReadingState = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.log('❌ Erro ao limpar:', error);
    }
};