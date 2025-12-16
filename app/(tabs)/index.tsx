import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Inspection, inspectionService } from '@/services/inspectionService';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadData = useCallback(async () => {
    try {
      const data = await inspectionService.getInspections();
      setInspections(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#FFC107';
    }
  };

  const renderItem = ({ item }: { item: Inspection }) => (
    <TouchableOpacity onPress={() => router.push(`/inspection/${item.id}`)} activeOpacity={0.8}>
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <View>
            <Text style={[styles.plate, isDark && styles.textLight]}>{item.plate}</Text>
            <Text style={[styles.vin, isDark && styles.textDim]}>{item.vin}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      {item.summary && (
        <Text style={[styles.summary, isDark && styles.textLight]} numberOfLines={2}>{item.summary}</Text>
      )}
      
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Text style={[styles.date, isDark && styles.textDim]}>{new Date(item.created_at).toLocaleDateString()}</Text>
        {item.risk_score !== undefined && (
            <Text style={[styles.risk, { color: item.risk_score > 50 ? '#F44336' : '#4CAF50' }]}>
                Risco: {item.risk_score}%
            </Text>
        )}
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Vistorias Recentes</ThemedText>
        <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={inspections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />
        }
        ListEmptyComponent={
            <View style={styles.empty}>
                <ThemedText>Nenhuma vistoria encontrada.</ThemedText>
            </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  plate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vin: {
    fontSize: 14,
    color: '#666',
  },
  textLight: {
    color: '#fff',
  },
  textDim: {
    color: '#aaa',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summary: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  footerDark: {
    borderTopColor: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  risk: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  }
});
