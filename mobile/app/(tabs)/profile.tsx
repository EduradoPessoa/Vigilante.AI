import { StyleSheet, TextInput, Alert, TouchableOpacity, Text, View, ScrollView, Image } from 'react-native';
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
            <View style={styles.avatarContainer}>
              {session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture ? (
                <Image 
                  source={{ uri: session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#FFF" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </View>
            <ThemedText type="title" style={styles.title}>Meu Perfil</ThemedText>
            <ThemedText style={styles.subtitle}>{session?.user.email}</ThemedText>
        </View>

        <View style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Informações Pessoais</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nome Completo</ThemedText>
              <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Seu nome"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={fullName}
                  onChangeText={setFullName}
              />
            </View>

            <View style={styles.divider} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Endereço</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>CEP</ThemedText>
              <View style={styles.cepContainer}>
                <TextInput
                    style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                    placeholder="00000-000"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={cep}
                    onChangeText={handleCepChange}
                    onBlur={handleCepBlur}
                    keyboardType="number-pad"
                    maxLength={9}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleCepBlur}>
                  <Ionicons name="search" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Logradouro</ThemedText>
              <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Rua, Avenida..."
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={street}
                  onChangeText={setStreet}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bairro</ThemedText>
              <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Bairro"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={neighborhood}
                  onChangeText={setNeighborhood}
              />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex2]}>
                  <ThemedText style={styles.label}>Cidade</ThemedText>
                  <TextInput
                      style={[styles.input, isDark && styles.inputDark]}
                      placeholder="Cidade"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      value={city}
                      onChangeText={setCity}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <ThemedText style={styles.label}>UF</ThemedText>
                  <TextInput
                      style={[styles.input, isDark && styles.inputDark]}
                      placeholder="UF"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      value={state}
                      onChangeText={setState}
                      maxLength={2}
                      autoCapitalize="characters"
                  />
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.buttonDisabled]} 
                onPress={updateProfile}
                disabled={loading}
            >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => {
                  Alert.alert('Sair', 'Tem certeza que deseja sair?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Sair', 
                      style: 'destructive', 
                      onPress: async () => {
                        await supabase.auth.signOut();
                      }
                    },
                  ]);
                }}
                disabled={loading}
            >
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    marginTop: 8,
    fontSize: 24,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.6,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#fff', // Theme me
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  cepContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    width: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 24,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
});
