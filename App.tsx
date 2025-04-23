// App.tsx
import React, { useEffect } from 'react';
import { AppState, BackHandler, Vibration } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import TextoLeituraView from './src/view/TextoLeituraView';
import { ReadingProvider } from './src/context/LeituraContext';

export default function App() {
  useKeepAwake();

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        Vibration.vibrate();
      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Vibration.vibrate();
      return true;
    });

    return () => {
      appStateListener.remove();
      backHandler.remove();
    };
  }, []);

  return (
    <ReadingProvider>
      <TextoLeituraView />
    </ReadingProvider>
  );
}