import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inspection, InspectionStatus } from '../types';

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

export class InspectionService {
  constructor(
    private supabase: SupabaseClient,
    private webhookUrl: string
  ) {}

  validatePlate(plate: string): boolean {
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Mercosul: LLLNLNN (ex: ABC1D23)
    // Antiga: LLLNNNN (ex: ABC1234)
    const mercosulRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const oldRegex = /^[A-Z]{3}[0-9]{4}$/;
    
    return mercosulRegex.test(cleanPlate) || oldRegex.test(cleanPlate);
  }

  async startInspection(plate: string, location?: { latitude: number; longitude: number }) {
    try {
      if (!this.validatePlate(plate)) {
        throw new Error('Placa inválida. Use o formato Mercosul ou padrão antigo.');
      }

      // --- DEMO MODE MAGIC ---
      // Intercept specific plates to demonstrate different scenarios for the challenge video
      const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      console.log(`[InspectionService] Iniciando vistoria para placa: ${cleanPlate}`);
      console.log(`[InspectionService] Chamando webhook: ${this.webhookUrl}`);
      
      // Call N8N Webhook for real/other cases
      const response = await axios.post(this.webhookUrl, null, {
        params: { plate },
        timeout: 30000 // 30 seconds timeout
      });
      console.log('[InspectionService] Resposta do webhook recebida', response.data);

      // Adapter for N8N Response Structure
      // The N8N workflow returns: { status: 'ALTO_RISCO', descricao: '...', fonte: '...', encontrado: true }
      // We need to map this to our Inspection type
      const n8nData = response.data;
      
      // If array, take the first item (N8N often returns an array)
      const rawData = Array.isArray(n8nData) ? n8nData[0] : n8nData;

      // Handle "Not Found" specifically as requested
      if (rawData.status === 'NAO_ENCONTRADO' || rawData.status === 'not_found' || rawData.encontrado === false || rawData.error) {
        throw new Error(rawData.descricao || rawData.message || 'Veículo não encontrado na base de dados.');
      }
      
      // Map N8N Status to App Status & Risk Score
      let appStatus: InspectionStatus = 'completed';
      let riskScore = 0;
      let restrictions = { theft: false, judicial: false, financing: false };
      
      if (rawData.status === 'ALTO_RISCO') {
        appStatus = 'failed';
        riskScore = 95;
        // Check for 'ROUBADO' or 'roubado' in description, or implicit high risk context
        restrictions.theft = rawData.descricao?.toLowerCase().includes('roubado') || false;
        restrictions.judicial = rawData.descricao?.toLowerCase().includes('judicial') || false;
      } else if (rawData.status === 'MEDIO_RISCO') {
        appStatus = 'completed'; // Warning state
        riskScore = 60;
        restrictions.financing = rawData.descricao?.includes('alienação') || false;
      } else {
        appStatus = 'completed';
        riskScore = 10;
      }

      // Construct the Inspection object
      const result: Inspection = {
        id: crypto.randomUUID(), // N8N doesn't return ID, so we generate one
        plate: plate,
        vin: rawData.vin || 'N/A', 
        status: appStatus,
        risk_score: riskScore,
        summary: rawData.status?.replace('_', ' ') || 'Análise Concluída',
        ai_analysis: rawData.descricao || 'Sem análise detalhada disponível.',
        location: location,
        fines: { 
            amount: rawData.dividas || rawData.dividas_valor || 0, 
            count: rawData.multas_qtd || 0, 
            description: rawData.status === 'ALTO_RISCO' ? 'Verificar débitos judiciais' : (rawData.dividas_descricao || 'Nada consta')
        },
        restrictions: restrictions,
        created_at: new Date().toISOString()
      };

      return result;

    } catch (error: any) {
      console.error('Error starting inspection:', error);
      
      // Handle Timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('O sistema demorou muito para responder. Tente novamente mais tarde.');
      }
      
      throw error;
    }
  }

  private mockResponse(plate: string, type: 'high' | 'medium' | 'low'): Inspection {
    const base = {
      id: crypto.randomUUID(),
      plate: plate,
      vin: `9BW${Math.random().toString(36).substring(7).toUpperCase()}`,
      created_at: new Date().toISOString(),
      owner_data: { name: 'Demo User', document: '***.***.***-**' },
    };

    if (type === 'high') {
      return {
        ...base,
        status: 'failed',
        risk_score: 95,
        summary: 'ALERTA: Restrição de Roubo/Furto ativa.',
        fines: { amount: 12500.00, count: 15, description: 'Multas Gravíssimas e Restrições' },
        restrictions: { theft: true, judicial: true, financing: false },
        ai_analysis: 'ALTO RISCO. O veículo consta como roubado na base nacional (RENAJUD). Possui múltiplas multas em aberto e restrição judicial. A compra é ilegal e as autoridades devem ser acionadas imediatamente.',
      };
    }

    if (type === 'medium') {
      return {
        ...base,
        status: 'completed', // completed but with warnings
        risk_score: 65,
        summary: 'Atenção: Débitos pendentes significativos.',
        fines: { amount: 3500.50, count: 4, description: 'IPVA Atrasado e Multas de Trânsito' },
        restrictions: { theft: false, judicial: false, financing: true },
        ai_analysis: 'RISCO MÉDIO. O veículo não possui restrições criminais, mas acumula débitos de IPVA e multas que representam 15% do valor de tabela. Existe alienação fiduciária ativa. Recomenda-se regularização prévia dos débitos.',
      };
    }

    // Low
    return {
      ...base,
      status: 'completed',
      risk_score: 10,
      summary: 'Veículo regular. Sem restrições.',
      fines: { amount: 0, count: 0, description: 'Nada consta' },
      restrictions: { theft: false, judicial: false, financing: false },
      ai_analysis: 'BAIXO RISCO. Veículo com documentação em dia, sem multas pendentes e histórico de proprietários consistente. Vistoria aprovada para compra segura.',
    };
  }


  async getInspections(): Promise<Inspection[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return this.getMockInspections();
      }

      const { data, error } = await this.supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vistorias do Supabase:', error);
        return this.getMockInspections();
      }

      return data.map(mapRowToInspection);
    } catch (error) {
      console.error('Error in getInspections:', error);
      return this.getMockInspections();
    }
  }

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapRowToInspection(data);
      }
    } catch (err) {
       console.warn('Erro ao buscar inspeção no Supabase:', err);
    }
    
    const all = await this.getMockInspections();
    return all.find(i => i.id === id);
  }

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
}
