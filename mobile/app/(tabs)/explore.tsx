import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { inspectionService, Inspection } from '@/services/inspectionService';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Inspection | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleScan = async () => {
    if (!plate) {
      Alert.alert('Erro', 'Preencha a Placa do veículo');
      return;
    }

    setLoading(true);
    setResult(null);
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

      const data = await inspectionService.startInspection(plate, location);
      setResult(data);
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

  const resetForm = () => {
    setResult(null);
    setPlate('');
  };

  if (result) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
           <View style={styles.resultHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: result.status === 'completed' ? '#E8F5E9' : result.status === 'failed' ? '#FFEBEE' : '#FFF8E1' }]}>
                <Ionicons 
                  name={result.status === 'completed' ? "checkmark-circle" : result.status === 'failed' ? "alert-circle" : "time"} 
                  size={48} 
                  color={result.status === 'completed' ? "#2E7D32" : result.status === 'failed' ? "#C62828" : "#F9A825"} 
                />
              </View>
              <ThemedText type="title" style={styles.resultTitle}>Análise Concluída</ThemedText>
              <View style={styles.plateTag}>
                <Text style={styles.plateTagText}>{result.plate}</Text>
              </View>
           </View>

           <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#4A90E2" />
                <ThemedText type="defaultSemiBold">Score de Risco</ThemedText>
              </View>
              <View style={styles.riskContainer}>
                <Text style={[styles.riskScoreLarge, { color: (result.risk_score || 0) > 50 ? '#D32F2F' : '#388E3C' }]}>
                  {result.risk_score ?? 'N/A'}
                </Text>
                <Text style={[styles.riskScale, isDark && styles.textDim]}>/ 100</Text>
              </View>
              <View style={styles.riskBarBg}>
                <View 
                  style={[
                    styles.riskBarFill, 
                    { 
                      width: `${result.risk_score || 0}%`,
                      backgroundColor: (result.risk_score || 0) > 50 ? '#D32F2F' : '#388E3C'
                    }
                  ]} 
                />
              </View>
           </View>

           <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color="#4A90E2" />
                <ThemedText type="defaultSemiBold">Parecer da IA</ThemedText>
              </View>
              <Text style={[styles.bodyText, isDark && styles.textDark]}>{result.ai_analysis || 'Sem análise disponível.'}</Text>
           </View>

           {result.fines && (
             <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="cash" size={24} color="#4A90E2" />
                  <ThemedText type="defaultSemiBold">Multas e Débitos</ThemedText>
                </View>
                <View style={styles.statsRow}>
                   <View style={styles.statItem}>
                      <Text style={[styles.statLabel, isDark && styles.textDim]}>Valor Total</Text>
                      <Text style={[styles.statValue, isDark && styles.textDark]}>R$ {result.fines.amount.toFixed(2)}</Text>
                   </View>
                   <View style={styles.statDivider} />
                   <View style={styles.statItem}>
                      <Text style={[styles.statLabel, isDark && styles.textDim]}>Quantidade</Text>
                      <Text style={[styles.statValue, isDark && styles.textDark]}>{result.fines.count}</Text>
                   </View>
                </View>
                <View style={styles.divider} />
                <Text style={[styles.bodyText, isDark && styles.textDark, { marginTop: 8 }]}>{result.fines.description}</Text>
             </View>
           )}

           {result.restrictions && (
             <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="warning" size={24} color="#4A90E2" />
                  <ThemedText type="defaultSemiBold">Restrições</ThemedText>
                </View>
                <View style={styles.restrictionRow}>
                   <View style={[styles.restrictionBadge, result.restrictions.theft ? styles.badgeDanger : styles.badgeSuccess]}>
                      <Ionicons name={result.restrictions.theft ? "alert" : "checkmark-circle"} size={16} color={result.restrictions.theft ? "#D32F2F" : "#388E3C"} />
                      <Text style={[styles.restrictionText, result.restrictions.theft ? styles.textDanger : styles.textSuccess]}>
                        Roubo: {result.restrictions.theft ? 'SIM' : 'NÃO'}
                      </Text>
                   </View>
                   <View style={[styles.restrictionBadge, result.restrictions.judicial ? styles.badgeDanger : styles.badgeSuccess]}>
                      <Ionicons name={result.restrictions.judicial ? "alert" : "checkmark-circle"} size={16} color={result.restrictions.judicial ? "#D32F2F" : "#388E3C"} />
                      <Text style={[styles.restrictionText, result.restrictions.judicial ? styles.textDanger : styles.textSuccess]}>
                        Judicial: {result.restrictions.judicial ? 'SIM' : 'NÃO'}
                      </Text>
                   </View>
                </View>
             </View>
           )}

           <TouchableOpacity style={styles.primaryButton} onPress={resetForm}>
              <Text style={styles.primaryButtonText}>Nova Consulta</Text>
           </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="scan-circle" size={80} color="#4A90E2" />
            </View>
            <ThemedText type="title" style={styles.heroTitle}>Nova Vistoria</ThemedText>
            <ThemedText style={styles.heroSubtitle}>Insira a placa para iniciar a análise de risco automática com IA.</ThemedText>
        </View>

        <View style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.inputLabel}>Placa do Veículo</ThemedText>
            <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                <Text style={styles.countryCode}>🇧🇷</Text>
                <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="ABC1234"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={plate}
                    onChangeText={(text) => setPlate(text.toUpperCase())}
                    maxLength={7}
                    autoCapitalize="characters"
                />
            </View>
            <Text style={styles.helperText}>Suporta Mercosul e padrão antigo</Text>
            
            <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.buttonDisabled]} 
                onPress={handleScan}
                disabled={loading}
            >
                {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.primaryButtonText}>Analisando...</Text>
                    </View>
                ) : (
                    <Text style={styles.primaryButtonText}>Iniciar Análise</Text>
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
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  heroTitle: {
    fontSize: 28,
    marginBottom: 10,
  },
  heroSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '80%',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#fff', // Use themed color in real app
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  inputLabel: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  inputContainerDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  countryCode: {
    fontSize: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#333',
  },
  inputDark: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Result Styles
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  plateTag: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  plateTagText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  riskScoreLarge: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  riskScale: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
  },
  riskBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  textDark: {
    color: '#eee',
  },
  textDim: {
    color: '#aaa',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  restrictionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  restrictionBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  badgeDanger: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  restrictionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textSuccess: {
    color: '#2E7D32',
  },
  textDanger: {
    color: '#C62828',
  },
});