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
3. Construa o pacote compartilhado (obrigatório para o funcionamento do Monorepo):
   ```bash
   npm run build --workspace=@vigilante/shared
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

### 🔌 Webhook Local (n8n)
Para que a análise de risco funcione localmente, é necessário ter um serviço escutando na porta `9090` ou ajustar a URL no código.
- URL Padrão: `http://localhost:9090/webhook-test/avaliar-veiculo`
- O sistema possui tratamento para `Timeout` e `Veículo Não Encontrado`.

## ⚙️ Configuração
Crie os arquivos `.env` nas pastas `web` e `mobile` baseados nos exemplos:

**Web (`web/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Mobile (`mobile/.env`):**
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🤖 Ferramentas de IA Utilizadas

Este projeto foi desenvolvido com o auxílio de ferramentas de IA para acelerar a produtividade, garantir a qualidade do código e prover funcionalidades inteligentes:

### Desenvolvimento (Pair Programming)
- **Trae AI (IDE)**: Utilizado como par programador principal para geração de código, refatoração e correção de bugs em tempo real.
- **Gemini 1.5 Pro**: Modelo de linguagem utilizado pelo assistente para raciocínio lógico, geração de testes unitários e solução de problemas complexos de infraestrutura (Monorepo/Expo).

### Funcionalidades do Sistema
- **n8n (Workflow Automation)**: Utilizado para orquestrar a inteligência do sistema, simulando uma análise de risco veicular que integra múltiplas fontes de dados e IA.
- **IA Generativa (via n8n)**: Responsável por gerar o "Parecer da Inteligência Artificial", analisando os dados brutos (multas, restrições) e criando um resumo textual explicativo para o usuário.

