// src/view/TextoLeituraView.tsx
import React from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useReading } from '../context/LeituraContext';
import styles from './styles/TextoLeituraViewStyles';

const TextoLeituraView = () => {
  const {
    state: { texto, botao, isReading, speed },
    dispatch,
    startReading,
    clearText,
    setSpeed,
  } = useReading();

  const handleTextChange = (text: string) => {
    dispatch({ type: 'SET_TEXTO', payload: text });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Cole seu texto aqui..."
        value={texto}
        onChangeText={handleTextChange}
        editable={!isReading}
      />

      <View style={styles.speedContainer}>
        <Text>Velocidade: {speed.toFixed(1)}x</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={3}
          step={0.1}
          value={speed}
          onValueChange={setSpeed}
          disabled={isReading}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1a9274"
        />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            title={botao}
            onPress={startReading}
            color="#1a9274"
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Limpar"
            onPress={clearText}
            disabled={isReading}
            color="#ff4444"
          />
        </View>
      </View>
    </View>
  );
};

export default TextoLeituraView;