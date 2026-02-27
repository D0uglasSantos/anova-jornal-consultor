import { Metric } from './types';

export const INITIAL_METRICS: Metric[] = [
  {
    id: 'custody',
    label: 'Custódia Multi-Bancos',
    value: 'R$ 452.5M',
    trend: 'Diversificado',
    trendDirection: 'neutral',
    color: 'bg-zinc-900',
    history: [40, 42, 45, 48, 50, 52, 55, 60],
    isMock: true,
    description: 'Distribuição total do AUM por custodiante. Alta concentração em XP, oportunidade de diversificação em Offshore.',
    breakdown: [
      { label: 'XP Investimentos', value: 'R$ 210.5M', impact: 'neutral' },
      { label: 'BTG Pactual', value: 'R$ 120.0M', impact: 'neutral' },
      { label: 'Banco Safra', value: 'R$ 80.5M', impact: 'neutral' },
      { label: 'Itaú Private', value: 'R$ 41.5M', impact: 'neutral' },
    ]
  },
  {
    id: 'net_new',
    label: 'Captação Líquida',
    value: 'R$ 12.8M',
    trend: '+15% meta',
    trendDirection: 'up',
    color: 'bg-zinc-900',
    history: [20, 30, 25, 50, 60, 80, 70, 95],
    isMock: true,
    description: 'Captação líquida acima da meta mensal. Destaque para migração de custódia.',
    breakdown: [
      { label: 'Família Costa (Ana)', value: 'R$ 5.0M', impact: 'positive', clientId: '2' },
      { label: 'Holding XYZ (Cx)', value: 'R$ 3.0M', impact: 'positive' },
      { label: 'Roberto Silva', value: 'R$ 1.2M', impact: 'positive', clientId: '1' }
    ]
  },
  {
    id: 'roa',
    label: 'ROA Médio (a.a.)',
    value: '0.82%',
    trend: '-0.02%',
    trendDirection: 'down',
    color: 'bg-zinc-900',
    history: [85, 84, 84, 83, 83, 82, 82, 82],
    isMock: true,
    description: 'Leve compressão de spread devido ao aumento de alocação em LCI/LCA isentos.',
    breakdown: [
      { label: 'Alocação em Isentos', value: '45% cart.', impact: 'negative' },
      { label: 'Comissão Variável', value: 'R$ 45k', impact: 'positive' },
    ]
  },
  {
    id: 'clients',
    label: 'Clientes Ativos',
    value: '142',
    trend: '+3 novos',
    trendDirection: 'up',
    color: 'bg-zinc-900',
    history: [10, 20, 40, 50, 60, 70, 80, 90],
    isMock: true,
    description: 'Três novos clientes ativados na semana passada. Pipeline saudável.',
    breakdown: [
      { label: 'Onboarding Concluído', value: '3', impact: 'positive' },
      { label: 'Em Prospectação', value: '12', impact: 'neutral' },
    ]
  },
  {
    id: 'maturities',
    label: 'Vencimentos (30d)',
    value: 'R$ 5.2M',
    trend: 'Alta Liq.',
    trendDirection: 'neutral',
    color: 'bg-zinc-900',
    history: [20, 10, 5, 80, 20, 10, 5, 5],
    isMock: true,
    description: 'Volume relevante de vencimentos em NTN-Bs e CDBs. Oportunidade de realocação.',
    breakdown: [
      { label: 'CDB Banco Master', value: 'R$ 2.0M', impact: 'neutral', clientId: '1' },
      { label: 'Tesouro IPCA+ 2024', value: 'R$ 1.5M', impact: 'neutral' },
    ]
  },
  {
    id: 'pending',
    label: 'Pendências',
    value: '8 Docs',
    trend: 'Ação Req.',
    trendDirection: 'down', 
    color: 'bg-zinc-900',
    history: [100, 80, 60, 40, 30, 20, 40, 60],
    isMock: true,
    description: 'Contratos de câmbio e termos de adesão aguardando assinatura digital.',
    breakdown: [
      { label: 'Termos de Adesão', value: '5', impact: 'negative' },
      { label: 'Atualização Cadastral', value: '3', impact: 'negative', clientId: '2' },
    ]
  },
  {
    id: 'offshore',
    label: 'Offshore Alloc.',
    value: 'US$ 12.4M',
    trend: 'Estável',
    trendDirection: 'neutral',
    color: 'bg-zinc-900',
    history: [50, 52, 53, 53, 54, 54, 55, 55],
    isMock: true,
    description: 'Alocação internacional via estruturas Cayman/BVI.',
    breakdown: [{ label: 'Bonds', value: '60%', impact: 'neutral' }]
  },
  {
    id: 'pipeline',
    label: 'Pipeline (Prospecção)',
    value: 'R$ 45M',
    trend: 'Quente',
    trendDirection: 'up',
    color: 'bg-zinc-900',
    history: [10, 15, 20, 25, 30, 40, 42, 45],
    isMock: true,
    description: 'Leads em fase avançada de negociação.',
    breakdown: [{ label: 'Família Y', value: 'R$ 20M', impact: 'positive' }]
  },
  {
    id: 'efficiency',
    label: 'Eficiência Operacional',
    value: '94%',
    trend: '+2%',
    trendDirection: 'up',
    color: 'bg-zinc-900',
    history: [90, 91, 91, 92, 92, 93, 93, 94],
    isMock: true,
    description: 'Índice de resolução de pendências em até 24h.',
    breakdown: [{ label: 'Backoffice', value: '98%', impact: 'positive' }]
  },
  {
    id: 'compliance_risk',
    label: 'Risco Compliance',
    value: 'Baixo',
    trend: 'Estável',
    trendDirection: 'neutral',
    color: 'bg-zinc-900',
    history: [10, 10, 10, 10, 10, 10, 10, 10],
    isMock: true,
    description: 'Monitoramento de PLD e Suitability.',
    breakdown: [{ label: 'Alertas', value: '0', impact: 'positive' }]
  },
];
