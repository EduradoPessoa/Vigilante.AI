export type InspectionStatus = 'pending' | 'completed' | 'failed';

export type Inspection = {
  id: string;
  plate: string;
  vin?: string;
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
  ai_analysis?: string;
  created_at: string;
};

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
