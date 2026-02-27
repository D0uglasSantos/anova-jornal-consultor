
export enum RiskProfile {
  CONSERVATIVE = 'Conservador',
  MODERATE = 'Moderado',
  AGGRESSIVE = 'Arrojado',
}

export enum TriggerType {
  REBALANCE = 'Rebalanceamento',
  PENSION = 'Previdência',
  CHURN = 'Risco de Churn',
  FIXED_INCOME = 'Renda Fixa',
  VARIABLE_INCOME = 'Renda Variável',
  LIQUIDITY = 'Caixa/Liquidez',
}

export enum Priority {
  HIGH = 'Alta',
  MEDIUM = 'Média',
  LOW = 'Baixa',
}

export interface AutopilotConfig {
  trustScore: number;
  rationale: string[];
  permissions: {
    autoSchedule: boolean;
    sendMarketUpdates: boolean;
    birthdayGreetings: boolean;
    portfolioRebalancing: boolean;
  };
  settings: {
    tone: 'formal' | 'neutral' | 'casual';
    periodicity: 'daily' | 'weekly' | 'monthly';
  };
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'completed';
}

export interface AllocationOrder {
  id: string;
  asset: string;
  ticker: string;
  type: 'buy' | 'sell';
  amount: number;
  status: 'pending' | 'executed' | 'cancelled';
  date: string;
}

export interface Client {
  id: string;
  name: string;
  avatarUrl: string;
  age?: number;
  profile?: RiskProfile;
  lifeStage?: string; // e.g., "Construção de Patrimônio", "Aposentadoria"
  mainTrigger: {
    type: TriggerType | string;
    priority: Priority;
    description: string;
    date: string;
  };
  aum: string; // Assets Under Management
  carteira?: string;
  conta?: string;
  // New Fields
  autopilot?: AutopilotConfig;
  goals?: FinancialGoal[];
  orders?: AllocationOrder[];
  fullData?: any; // Detailed data from the new API
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'meeting' | 'whatsapp' | 'transaction' | 'system';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface Notification {
  id: string;
  clientId: string;
  clientName: string;
  avatarUrl: string;
  message: string;
  time: string;
  isAudio: boolean;
  count?: number;
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'TRIGGER_LIST'; trigger: TriggerType }
  | { type: 'CLIENT_BOOK'; clientId: string; section?: string };

export type ViewContext = 'ALL' | 'PENSION' | 'CHURN' | 'PORTFOLIO';

export interface Metric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  color: string;
  description: string;
  history: number[]; // Simple array for sparklines
  isMock?: boolean;
  breakdown: { 
    label: string; 
    value: string; 
    impact: 'positive' | 'negative' | 'neutral';
    clientId?: string; // Optional deep link to a client
  }[];
}

export type AgentRole = 'strategist' | 'concierge' | 'hunter' | 'compliance';

export interface Agent {
  id: AgentRole;
  name: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon name mapping
  color: string;
  capabilities: string[];
}
