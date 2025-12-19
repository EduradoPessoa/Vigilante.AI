import axios from 'axios';
import { ViaCepResponse } from '../types';

export const viaCepService = {
  async getAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return null;

      const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (response.data.erro) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  }
};
