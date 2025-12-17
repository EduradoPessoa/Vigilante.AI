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

## 🛠 Tech Stack (Monorepo)

O projeto foi reestruturado como um Monorepo contendo:

### 🌐 Web (`/web`)
- **Framework**: Next.js 14+ (App Router)
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Mapas**: Google Maps Embed

### 📱 Mobile (`/mobile`)
- **Framework**: React Native (Expo)
- **Roteamento**: Expo Router
- **Mapas**: react-native-maps

### ☁️ Backend & Serviços
- **Supabase**: Auth, Database
- **N8N**: Orquestração de workflows (Mockado)
- **Axios**: HTTP Client

## 📦 Como Rodar

1. Clone o repositório.
2. Instale as dependências na raiz:
   ```bash
   npm install
   ```

### Rodando a Aplicação Web (Next.js)
```bash
npm run web
# ou
cd web && npm run dev
```
Acesse: http://localhost:3000

### Rodando a Aplicação Mobile (Expo)
```bash
npm run mobile
# ou
cd mobile && npx expo start
```
Use o app **Expo Go** no seu celular para escanear o QR Code.

## ⚙️ Configuração
Crie os arquivos `.env` nas pastas `web` e `mobile` baseados nos exemplos:

**Web (`web/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_N8N_WEBHOOK_URL=...
```

**Mobile (`mobile/.env`):**
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_N8N_WEBHOOK_URL=...
```

## 🤖 Ferramentas de IA Utilizadas

Este projeto foi desenvolvido com o auxílio de ferramentas de IA para acelerar a produtividade e garantir a qualidade do código:

- **Trae AI (IDE)**: Utilizado como par programador principal para geração de código (Next.js/React Native), refatoração, correção de bugs e automação de commits.
- **Claude 3.5 Sonnet / GPT-4o**: Modelos subjacentes utilizados pelo agente para raciocínio lógico complexo e estruturação de arquitetura.

