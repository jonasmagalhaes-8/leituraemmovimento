import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio/Sound';
import { EventSubscription } from 'expo-modules-core';
import { Accelerometer } from 'expo-sensors';
import { Vibration } from 'react-native';
import { clearReadingState, loadReadingState, saveReadingState } from '../storagepreferences/LocalStorage';

type State = {
    texto: string;
    botao: string;
    sound: Sound | null;
    speed: number;
    isReading: boolean;
    subscription: EventSubscription | null;
    currentIndex: number;
    readingInterval: NodeJS.Timeout | null;
    words: string[];
};

type Action =
    | { type: 'SET_TEXTO'; payload: string | ((prev: string) => string) }
    | { type: 'SET_BOTAO'; payload: string }
    | { type: 'SET_SOUND'; payload: Sound | null }
    | { type: 'SET_SPEED'; payload: number }
    | { type: 'SET_IS_READING'; payload: boolean }
    | { type: 'SET_SUBSCRIPTION'; payload: EventSubscription | null }
    | { type: 'SET_CURRENT_INDEX'; payload: number }
    | { type: 'SET_READING_INTERVAL'; payload: NodeJS.Timeout | null }
    | { type: 'CLEAR_TEXT' }
    | { type: 'RESET_READING' }
    | { type: 'SET_WORDS'; payload: string[] };

const initialState: State = {
    texto: "",
    botao: "Leitura",
    sound: null,
    speed: 1,
    isReading: false,
    subscription: null,
    currentIndex: 0,
    readingInterval: null,
    words: [],
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_TEXTO':
            return {
                ...state,
                texto: typeof action.payload === 'function' ? action.payload(state.texto) : action.payload,
            };
        case 'SET_BOTAO':
            return { ...state, botao: action.payload };
        case 'SET_SOUND':
            return { ...state, sound: action.payload };
        case 'SET_SPEED':
            return { ...state, speed: action.payload };
        case 'SET_IS_READING':
            return { ...state, isReading: action.payload };
        case 'SET_SUBSCRIPTION':
            return { ...state, subscription: action.payload };
        case 'SET_CURRENT_INDEX':
            return { ...state, currentIndex: action.payload };
        case 'SET_READING_INTERVAL':
            return { ...state, readingInterval: action.payload };
        case 'SET_WORDS':
            return { ...state, words: action.payload };
        case 'CLEAR_TEXT':
            return {
                ...state,
                texto: "",
                currentIndex: 0,
                botao: "Leitura",
                isReading: false,
                words: []
            };
        case 'RESET_READING':
            return { ...state, botao: "Leitura", isReading: false };
        default:
            return state;
    }
};

const ReadingContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
    playSound: () => void;
    startSensor: () => void;
    stopSensor: () => void;
    startReading: () => Promise<void>;
    clearText: () => Promise<void>;
    setSpeed: (speed: number) => void;
}>(null!);

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const loadState = async () => {
            const savedState = await loadReadingState();
            if (savedState) {
                dispatch({ type: 'SET_TEXTO', payload: savedState.texto });
                dispatch({ type: 'SET_CURRENT_INDEX', payload: savedState.currentIndex });
                dispatch({ type: 'SET_SPEED', payload: savedState.speed });
                dispatch({ type: 'SET_WORDS', payload: savedState.words });
                dispatch({ type: 'SET_IS_READING', payload: savedState.isReading });

                if (savedState.isReading) {
                    dispatch({ type: 'SET_BOTAO', payload: "Pausar Leitura" });
                }
            }
        };
        loadState();
    }, []);

    const playSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(require('../assets/sound.mp3'));
            dispatch({ type: 'SET_SOUND', payload: sound });
            await sound.playAsync();
        } catch (error) {
            console.error("Erro ao tocar som:", error);
        }
    };

    const startSensor = () => {
        const subscription = Accelerometer.addListener(({ x, y, z }) => {
            if (Math.sqrt(x * x + y * y + z * z) >= 1.09) {
                playSound();
                Vibration.vibrate();
            }
        });
        dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
        Accelerometer.setUpdateInterval(1000);
    };

    const stopSensor = () => {
        if (state.subscription) {
            state.subscription.remove();
            dispatch({ type: 'SET_SUBSCRIPTION', payload: null });
        }
    };

    const startReading = async () => {
        if (state.texto.trim() === "") {
            alert("Cole o texto para leitura!");
            return;
        }

        if (!state.isReading) {
            const words = state.words.length > 0 ? state.words : state.texto.split(" ");
            let index = state.currentIndex;

            if (state.words.length === 0) {
                dispatch({ type: 'SET_WORDS', payload: words });
                index = 0;
            }

            dispatch({ type: 'SET_BOTAO', payload: "Pausar Leitura" });
            dispatch({ type: 'SET_IS_READING', payload: true });
            startSensor();

            const interval = setInterval(() => {
                if (index < words.length) {
                    const displayedText = words.slice(0, index + 1).join(" ");
                    dispatch({
                        type: 'SET_TEXTO',
                        payload: displayedText,
                    });
                    dispatch({ type: 'SET_CURRENT_INDEX', payload: index + 1 });
                    index++;
                } else {
                    clearInterval(interval);
                    dispatch({ type: 'SET_BOTAO', payload: "Leitura" });
                    dispatch({ type: 'SET_IS_READING', payload: false });
                    dispatch({ type: 'SET_READING_INTERVAL', payload: null });
                    stopSensor();
                    dispatch({ type: 'SET_WORDS', payload: [] });
                    dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
                }
            }, 1000 / state.speed);

            dispatch({ type: 'SET_READING_INTERVAL', payload: interval });
        } else {
            await saveReadingState({
                texto: state.texto,
                currentIndex: state.currentIndex,
                speed: state.speed,
                words: state.words,
                isReading: false
            });

            dispatch({ type: 'SET_BOTAO', payload: "Leitura" });
            dispatch({ type: 'SET_IS_READING', payload: false });

            if (state.readingInterval) {
                clearInterval(state.readingInterval);
                dispatch({ type: 'SET_READING_INTERVAL', payload: null });
            }

            stopSensor();
        }
    };

    const clearText = async () => {
        await clearReadingState();
        dispatch({ type: 'CLEAR_TEXT' });
        if (state.readingInterval) clearInterval(state.readingInterval);
        dispatch({ type: 'SET_READING_INTERVAL', payload: null });
        stopSensor();
    };

    const setSpeed = (speed: number) => {
        dispatch({ type: 'SET_SPEED', payload: speed });
    };

    return (
        <ReadingContext.Provider
            value={{
                state,
                dispatch,
                playSound,
                startSensor,
                stopSensor,
                startReading,
                clearText,
                setSpeed,
            }}>
            {children}
        </ReadingContext.Provider>
    );
};

export const useReading = () => useContext(ReadingContext);
