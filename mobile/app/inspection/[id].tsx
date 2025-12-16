import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { inspectionService, Inspection } from '@/services/inspectionService';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InspectionDetail() {
  const { id } = useLocalSearchParams();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function load() {
      if (typeof id === 'string') {
        const data = await inspectionService.getInspectionById(id);
        setInspection(data || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </ThemedView>
    );
  }

  if (!inspection) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Vistoria não encontrada.</ThemedText>
      </ThemedView>
    );
  }

  const getRiskColor = (score?: number) => {
    if (score === undefined) return '#888';
    if (score < 30) return '#4CAF50'; // Green
    if (score < 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `Vistoria ${inspection.plate}` }} />
      <ScrollView>
        {/* Status Header */}
        <View style={[styles.section, { backgroundColor: getRiskColor(inspection.risk_score) + '20' }]}>
            <View style={styles.row}>
                <Ionicons 
                    name={inspection.status === 'completed' ? 'checkmark-circle' : 'alert-circle'} 
                    size={40} 
                    color={getRiskColor(inspection.risk_score)} 
                />
                <View style={styles.headerText}>
                    <ThemedText type="title">Risco: {inspection.risk_score}%</ThemedText>
                    <ThemedText style={styles.statusText}>Status: {inspection.status.toUpperCase()}</ThemedText>
                </View>
            </View>
        </View>

        {/* AI Analysis */}
        {inspection.ai_analysis && (
            <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name="sparkles" size={24} color="#9C27B0" />
                    <ThemedText type="subtitle">Parecer da IA</ThemedText>
                </View>
                <Text style={[styles.aiText, isDark && styles.textLight]}>{inspection.ai_analysis}</Text>
            </View>
        )}

        {/* Vehicle Info */}
        <View style={[styles.card, isDark && styles.cardDark]}>
            <ThemedText type="subtitle">Dados do Veículo</ThemedText>
            <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.textDim]}>Placa:</Text>
                <Text style={[styles.value, isDark && styles.textLight]}>{inspection.plate}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.textDim]}>VIN:</Text>
                <Text style={[styles.value, isDark && styles.textLight]}>{inspection.vin}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.textDim]}>Data:</Text>
                <Text style={[styles.value, isDark && styles.textLight]}>{new Date(inspection.created_at).toLocaleString()}</Text>
            </View>
        </View>

        {/* Owner Info (Mocked from Juridico) */}
        {inspection.owner_data && (
            <View style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText type="subtitle">Proprietário (Jurídico)</ThemedText>
                <View style={styles.infoRow}>
                    <Text style={[styles.label, isDark && styles.textDim]}>Nome:</Text>
                    <Text style={[styles.value, isDark && styles.textLight]}>{inspection.owner_data.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.label, isDark && styles.textDim]}>Doc:</Text>
                    <Text style={[styles.value, isDark && styles.textLight]}>{inspection.owner_data.document}</Text>
                </View>
            </View>
        )}

        {/* Restrictions */}
        {inspection.restrictions && (
            <View style={[styles.card, isDark && styles.cardDark]}>
                <ThemedText type="subtitle">Restrições</ThemedText>
                <View style={styles.tagContainer}>
                    <View style={[styles.tag, inspection.restrictions.theft ? styles.tagDanger : styles.tagSuccess]}>
                        <Text style={styles.tagText}>Roubo/Furto: {inspection.restrictions.theft ? 'SIM' : 'NÃO'}</Text>
                    </View>
                    <View style={[styles.tag, inspection.restrictions.judicial ? styles.tagWarning : styles.tagSuccess]}>
                        <Text style={styles.tagText}>Judicial: {inspection.restrictions.judicial ? 'SIM' : 'NÃO'}</Text>
                    </View>
                </View>
            </View>
        )}

        {/* Location Map */}
        {inspection.location && (
            <View style={styles.mapContainer}>
                <ThemedText type="subtitle" style={styles.mapTitle}>Local da Vistoria</ThemedText>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: inspection.location.latitude,
                        longitude: inspection.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: inspection.location.latitude,
                            longitude: inspection.location.longitude,
                        }}
                        title={`Vistoria: ${inspection.plate}`}
                    />
                </MapView>
            </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerText: {
    flex: 1,
  },
  statusText: {
    opacity: 0.7,
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    margin: 15,
    marginBottom: 0,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aiText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    fontStyle: 'italic',
  },
  textLight: {
    color: '#eee',
  },
  textDim: {
    color: '#aaa',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  tagSuccess: {
    backgroundColor: '#4CAF50',
  },
  tagWarning: {
    backgroundColor: '#FFC107',
  },
  tagDanger: {
    backgroundColor: '#F44336',
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  mapContainer: {
    margin: 15,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapTitle: {
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
