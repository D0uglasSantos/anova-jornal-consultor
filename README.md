<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nova ANOVA Investimentos — Plataforma Consultor

Plataforma WealthTech B2B para consultores financeiros da ANOVA Investimentos. Cockpit com gestão de clientes, métricas em tempo real e cadastro completo (CPF e CNPJ), com insights assistidos por IA.

## Funcionalidades

- **Dashboard**: Métricas de custódia, captação líquida, ROA, clientes ativos, vencimentos e pendências
- **Jornal de Clientes**: Visualização por contexto (Previdência, Churn, Carteira) com triggers e prioridades
- **Cadastro de Clientes**: Fluxo multi-step para pessoa física (CPF) e jurídica (CNPJ)
- **Overlay de Cliente**: Visão detalhada por cliente com dados e ações
- **Integração API**: Conectada à API da ANOVA Investimentos

## Tecnologias

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- React Hook Form + Zod
- Recharts
- Google Gemini AI

## Pré-requisitos

- Node.js 18+

## Executando localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   GEMINI_API_KEY=sua_chave_gemini
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Scripts disponíveis

| Comando        | Descrição                          |
|----------------|------------------------------------|
| `npm run dev`  | Servidor de desenvolvimento (Vite) |
| `npm run build`| Build de produção                  |
| `npm run preview` | Pré-visualização do build        |
| `npm run lint` | Verificação TypeScript             |

## Estrutura do projeto

```
├── components/          # Componentes React
│   ├── registration/    # Fluxo de cadastro (steps CPF/CNPJ)
│   ├── HomeJournal.tsx  # Dashboard principal
│   ├── ClientOverlay.tsx
│   ├── ClientRegistrationPage.tsx
│   └── ...
├── services/            # Serviços (API, Gemini)
├── types.ts
├── constants.ts
└── App.tsx
```

## Referência AI Studio

Visualize o app no AI Studio: [https://ai.studio/apps/029ec953-eea1-46b9-b6c6-f2fd761025df](https://ai.studio/apps/029ec953-eea1-46b9-b6c6-f2fd761025df)
