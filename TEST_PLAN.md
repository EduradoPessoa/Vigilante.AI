# Plano de Teste - Vigilante.AI

## 1. Introdução
Este documento descreve a estratégia de teste para o sistema Vigilante.AI, abrangendo os aplicativos Mobile e Web, bem como a integração com o Backend (Supabase/n8n).

## 2. Escopo do Teste
O objetivo é validar a funcionalidade, usabilidade e integridade dos dados do sistema.

### Componentes a Testar:
*   **Mobile App (React Native/Expo)**: Login, Navegação, Início de Vistoria, Visualização de Histórico.
*   **Web App (Next.js)**: Login, Dashboard, Nova Vistoria, Perfil.
*   **Services**: `inspectionService` (Validações, API calls), `viaCepService`.
*   **Banco de Dados**: Schema, RLS (Row Level Security).

## 3. Tipos de Teste
1.  **Análise Estática de Código**: Revisão manual de segurança e boas práticas.
2.  **Testes Unitários (Automatizados)**: Verificação de funções utilitárias e regras de negócio isoladas.
3.  **Testes de Integração (Simulados)**: Verificação dos fluxos de dados entre front-end e serviços.
4.  **Testes de Interface (Manuais)**: Verificação de layout e usabilidade (simulado via revisão de código).

## 4. Critérios de Aceitação
*   **Login**: Usuário deve conseguir logar e manter sessão.
*   **Vistoria**:
    *   Placa deve ser validada (Mercosul/Antiga).
    *   Registro deve ser salvo no banco (simulado).
    *   Status deve iniciar como 'pending'.
*   **Segurança**: Dados sensíveis não devem ser expostos sem autenticação (RLS).

## 5. Ferramentas
*   **Jest**: Para testes unitários automatizados (a ser implementado).
*   **Manual Code Review**: Para análise de segurança e arquitetura.
