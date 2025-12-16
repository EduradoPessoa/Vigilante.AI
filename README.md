# Vigilante.AI

A "Vigilante.AI" é uma startup que precisa de um MVP para vistoria veicular automatizada. O sistema permite que um agente de campo registre um veículo, valide sua situação legal e obtenha um resumo inteligente sobre o risco daquele automóvel.

## 🚀 Funcionalidades

- **Autenticação**: Login e Cadastro via Supabase Auth.
- **Perfil do Agente**: Cadastro com preenchimento automático de endereço (ViaCEP).
- **Vistoria Veicular**:
  - Input de Placa (Mercosul/Antiga) e VIN.
  - Geolocalização automática do local da vistoria.
  - Mock de integração com N8N para análise de risco e dados jurídicos.
- **Dashboard**: Visualização de vistorias recentes com indicadores de risco.
- **Detalhes da Vistoria**: Mapa interativo e parecer gerado por IA.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo) + Expo Router
- **Backend**: Supabase (Auth, Database)
- **Automação/IA**: N8N (Mockado na versão atual)
- **Mapas**: react-native-maps
- **HTTP Client**: Axios

## 📦 Como Rodar

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz baseado no `.env.example` e preencha com suas chaves do Supabase.
4. Execute o projeto:
   - Web: `npm run web`
   - Mobile: `npm run android` ou `npm run ios`

## 🗄️ Banco de Dados (Supabase)

Execute o script `supabase_schema.sql` no Editor SQL do seu projeto Supabase para criar as tabelas e políticas de segurança necessárias.
