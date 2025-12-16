import { StyleSheet, TextInput, Alert, TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { viaCepService } from '@/services/viaCepService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fullName, setFullName] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, address_cep, address_street, address_neighborhood, address_city, address_state`)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFullName(data.full_name || '');
        setCep(data.address_cep || '');
        setStreet(data.address_street || '');
        setNeighborhood(data.address_neighborhood || '');
        setCity(data.address_city || '');
        setState(data.address_state || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        // Silent fail for profile not found (first login)
        console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        full_name: fullName,
        address_cep: cep,
        address_street: street,
        address_neighborhood: neighborhood,
        address_city: city,
        address_state: state,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCepChange = (text: string) => {
    // Remove tudo que não é dígito
    let value = text.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setCep(value);
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
        const address = await viaCepService.getAddressByCep(cleanCep);
        if (address) {
            setStreet(address.logradouro);
            setNeighborhood(address.bairro);
            setCity(address.localidade);
            setState(address.uf);
        } else {
            Alert.alert('Aviso', 'CEP não encontrado.');
        }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
            <Ionicons name="person-circle" size={80} color="#4A90E2" />
            <ThemedText type="title" style={styles.title}>Meu Perfil</ThemedText>
            <ThemedText style={styles.subtitle}>{session?.user.email}</ThemedText>
        </View>

        <View style={styles.form}>
            <ThemedText type="subtitle">Nome Completo</ThemedText>
            <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Seu nome"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={fullName}
                onChangeText={setFullName}
            />

            <ThemedText type="subtitle">Endereço (Busca por CEP)</ThemedText>
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                    placeholder="CEP (00000-000)"
                    placeholderTextColor={isDark ? '#888' : '#666'}
                    value={cep}
                    onChangeText={handleCepChange}
                    onBlur={handleCepBlur}
                    keyboardType="number-pad"
                    maxLength={9}
                />
            </View>

            <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Rua"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={street}
                onChangeText={setStreet}
            />

            <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Bairro"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={neighborhood}
                onChangeText={setNeighborhood}
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.flex2, isDark && styles.inputDark]}
                    placeholder="Cidade"
                    placeholderTextColor={isDark ? '#888' : '#666'}
                    value={city}
                    onChangeText={setCity}
                />
                <TextInput
                    style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                    placeholder="UF"
                    placeholderTextColor={isDark ? '#888' : '#666'}
                    value={state}
                    onChangeText={setState}
                    maxLength={2}
                />
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={updateProfile}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Perfil'}</Text>
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
    marginBottom: 30,
  },
  title: {
    marginTop: 10,
  },
  subtitle: {
    marginTop: 5,
    opacity: 0.7,
  },
  form: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
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
