import axios from 'axios';

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
   * Inicia uma nova vistoria enviando dados para o n8n
   */
  async startInspection(plate: string, vin: string, location?: { latitude: number; longitude: number }) {
    try {
      if (!this.validatePlate(plate)) {
        throw new Error('Placa inválida. Use o formato Mercosul ou padrão antigo.');
      }

      // Mock de sucesso para teste sem backend real
      if (N8N_WEBHOOK_URL.includes('your-n8n-instance')) {
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

      // Chamada ao n8n
      const response = await axios.post(N8N_WEBHOOK_URL, {
        plate,
        vin,
        location,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error('Error starting inspection:', error);
      throw error;
    }
  },

  /**
   * Busca vistorias (Mockado por enquanto ou do Supabase)
   */
  async getInspections(): Promise<Inspection[]> {
    // Mock return com dados ricos
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
  },

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    const all = await this.getInspections();
    return all.find(i => i.id === id);
  }
};
