import axios from 'axios';
import { supabase } from '@/lib/supabase';

// URL do webhook do n8n
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/inspection';

export type InspectionStatus = 'pending' | 'completed' | 'failed';

export type Inspection = {
  id: string;
  plate: string;
  vin: string;
  status: InspectionStatus;
  risk_score?: number;
  summary?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  owner_data?: {
    name: string;
    document: string;
  };
  fines?: {
    amount: number;
    count: number;
    description: string;
  };
  restrictions?: {
    theft: boolean;
    judicial: boolean;
    financing: boolean;
  };
  ai_analysis?: string; // Parecer da IA
  created_at: string;
};

// Helper to map Supabase row to Inspection type
const mapRowToInspection = (row: any): Inspection => {
  return {
    id: row.id,
    plate: row.plate,
    vin: row.vin,
    status: row.status as InspectionStatus,
    risk_score: row.risk_score,
    summary: row.summary,
    location: row.latitude && row.longitude ? {
      latitude: row.latitude,
      longitude: row.longitude
    } : undefined,
    owner_data: row.owner_data,
    fines: row.fines,
    restrictions: row.restrictions,
    ai_analysis: row.ai_analysis,
    created_at: row.created_at
  };
};

export const inspectionService = {
  /**
   * Valida formato de placa (Mercosul ou Antiga)
   */
  validatePlate(plate: string): boolean {
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Mercosul: LLLNLNN (ex: ABC1D23)
    // Antiga: LLLNNNN (ex: ABC1234)
    const mercosulRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const oldRegex = /^[A-Z]{3}[0-9]{4}$/;
    
    return mercosulRegex.test(cleanPlate) || oldRegex.test(cleanPlate);
  },

  /**
   * Inicia uma nova vistoria salvando no Supabase
   */
  async startInspection(plate: string, vin: string, location?: { latitude: number; longitude: number }) {
    try {
      if (!this.validatePlate(plate)) {
        throw new Error('Placa inválida. Use o formato Mercosul ou padrão antigo.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Se não houver usuário logado ou for modo demo/mock explícito
      if (!user || N8N_WEBHOOK_URL.includes('your-n8n-instance')) {
        console.warn('Usando modo Mock/Demo para startInspection');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ 
                    success: true, 
                    message: "Vistoria iniciada (Mock)",
                    inspectionId: 'mock-id-' + Date.now() 
                });
            }, 1500);
        });
      }

      // 1. Criar registro no Supabase
      const { data, error } = await supabase
        .from('inspections')
        .insert({
          user_id: user.id,
          plate,
          vin,
          latitude: location?.latitude,
          longitude: location?.longitude,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Opcional: Chamar webhook do n8n se configurado
      // Em produção, isso poderia ser feito via Database Webhooks (Supabase) ou aqui
      if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes('your-n8n-instance')) {
         axios.post(N8N_WEBHOOK_URL, {
          inspection_id: data.id,
          plate,
          vin,
          location,
          timestamp: new Date().toISOString(),
        }).catch(err => console.error('Erro ao chamar webhook n8n:', err));
      }

      return {
        success: true,
        message: "Vistoria iniciada",
        inspectionId: data.id
      };
    } catch (error) {
      console.error('Error starting inspection:', error);
      throw error;
    }
  },

  /**
   * Busca vistorias do Supabase
   */
  async getInspections(): Promise<Inspection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fallback para Mock se não autenticado
      if (!user) {
        return this.getMockInspections();
      }

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vistorias do Supabase:', error);
        // Se a tabela não existir, retorna mock para não quebrar a UI
        return this.getMockInspections();
      }

      return data.map(mapRowToInspection);
    } catch (error) {
      console.error('Error in getInspections:', error);
      return this.getMockInspections();
    }
  },

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    try {
      // Tenta buscar no Supabase primeiro
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapRowToInspection(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar inspeção no Supabase, tentando mock...', err);
    }

    // Fallback para mock se não encontrar ou der erro (ex: ID de mock)
    const allMocks = await this.getMockInspections();
    return allMocks.find(i => i.id === id);
  },

  // Dados mockados originais movidos para função auxiliar
  async getMockInspections(): Promise<Inspection[]> {
    return [
      {
        id: '1',
        plate: 'ABC-1234',
        vin: '9BWZC...',
        status: 'completed',
        risk_score: 15,
        summary: 'Veículo regular. Sem restrições de roubo ou furto.',
        location: { latitude: -23.55052, longitude: -46.633309 },
        owner_data: { name: 'João Silva', document: '***.123.456-**' },
        fines: { amount: 0, count: 0, description: 'Nada consta' },
        restrictions: { theft: false, judicial: false, financing: false },
        ai_analysis: 'O veículo apresenta baixo risco para compra. A documentação está regular, não há multas pendentes e o histórico de proprietários é consistente. Recomenda-se apenas vistoria mecânica padrão.',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        plate: 'XYZ-9876',
        vin: '1HGBH...',
        status: 'pending',
        location: { latitude: -22.9068, longitude: -43.1729 },
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        plate: 'RUA-2024',
        vin: '3VWD...',
        status: 'failed',
        risk_score: 85,
        summary: 'ALERTA: Restrição de Roubo/Furto ativa.',
        location: { latitude: -19.9167, longitude: -43.9345 },
        owner_data: { name: 'Desconhecido', document: 'Unknown' },
        fines: { amount: 5000, count: 12, description: 'Multas diversas' },
        restrictions: { theft: true, judicial: true, financing: false },
        ai_analysis: 'ALTO RISCO. O veículo consta como roubado na base nacional. Além disso, possui restrição judicial ativa. A compra é altamente desencorajada e as autoridades devem ser notificadas.',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  }
};
