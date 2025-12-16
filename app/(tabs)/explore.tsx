import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { inspectionService } from '@/services/inspectionService';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleScan = async () => {
    if (!plate || !vin) {
      Alert.alert('Erro', 'Preencha a Placa e o VIN');
      return;
    }

    setLoading(true);
    try {
      let location = undefined;
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Aviso', 'Permissão de localização negada. A vistoria será salva sem geolocalização.');
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
        };
      }

      await inspectionService.startInspection(plate, vin, location);
      Alert.alert('Sucesso', 'Vistoria iniciada! A análise está em processamento.');
      setPlate('');
      setVin('');
      router.push('/(tabs)');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Falha desconhecida ao iniciar vistoria');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
            <Ionicons name="car-sport" size={60} color="#4A90E2" />
            <ThemedText type="title" style={styles.title}>Nova Vistoria</ThemedText>
            <ThemedText style={styles.subtitle}>Insira os dados do veículo para análise de risco</ThemedText>
        </View>

        <View style={styles.form}>
            <ThemedText type="subtitle">Placa do Veículo</ThemedText>
            <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="ABC-1234"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={plate}
                onChangeText={(text) => setPlate(text.toUpperCase())}
                maxLength={8}
            />

            <ThemedText type="subtitle">VIN (Chassi)</ThemedText>
            <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Informe o chassi"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={vin}
                onChangeText={(text) => setVin(text.toUpperCase())}
            />
            
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleScan}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Iniciar Análise</Text>
                )}
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7,
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    color: '#fff',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
