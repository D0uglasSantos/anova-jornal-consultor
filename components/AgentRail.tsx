
import React from 'react';
import { Brain, Calendar, Target, ShieldCheck, LucideIcon, Settings } from 'lucide-react';
import { Agent, AgentRole } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'strategist',
    name: 'Atlas',
    title: 'Estrategista de Portfólio',
    description: 'Analisa carteiras, sugere rebalanceamento e identifica riscos de mercado.',
    iconName: 'Brain',
    color: 'bg-indigo-600',
    capabilities: ['Revisão de Asset Allocation', 'Análise de Cenário Macro', 'Sugestão de Hedge']
  },
  {
    id: 'concierge',
    name: 'Luna',
    title: 'Concierge & Agenda',
    description: 'Organiza reuniões, prepara pautas e gerencia o relacionamento com o cliente.',
    iconName: 'Calendar',
    color: 'bg-rose-500',
    capabilities: ['Preparar 5 reuniões', 'Enviar presentes', 'Agendar calls anuais']
  },
  {
    id: 'hunter',
    name: 'Orion',
    title: 'Prospecção & Growth',
    description: 'Identifica oportunidades na base e busca novos leads qualificados.',
    iconName: 'Target',
    color: 'bg-emerald-500',
    capabilities: ['Identificar Potencial', 'Mapear Network', 'Campanhas de Email']
  },
  {
    id: 'compliance',
    name: 'Guardian',
    title: 'Risco & Compliance',
    description: 'Garante conformidade regulatória e adequação (Suitability) dos clientes.',
    iconName: 'ShieldCheck',
    color: 'bg-slate-600',
    capabilities: ['Checar Suitability', 'Alertas de KYC', 'Documentos Pendentes']
  }
];

export const IconMap: Record<string, LucideIcon> = {
  Brain,
  Calendar,
  Target,
  ShieldCheck
};

interface AgentRailProps {
  onSelectAgent: (agent: Agent) => void;
  onOpenSettings: () => void;
}

export const AgentRail: React.FC<AgentRailProps> = ({ onSelectAgent, onOpenSettings }) => {
  return (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 z-[60] flex-col items-center py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Icon - Anova Official */}
      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-12 shadow-lg cursor-default overflow-hidden p-2">
        <img 
          src="/assets/logo-white.svg" 
          alt="Anova Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-8 w-full px-4 flex-1">
        {AGENTS.map((agent) => {
          const Icon = IconMap[agent.iconName];
          return (
            <div key={agent.id} className="relative group flex justify-center">
              {/* Tooltip Pop-up */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-4 w-64 bg-slate-900 text-white p-4 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-x-0 translate-x-2 shadow-xl z-50 pointer-events-none">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-900"></div>
                <div className="flex items-center gap-2 mb-1">
                   <div className={`w-2 h-2 rounded-full ${agent.color.replace('bg-', 'bg-white/80 ')}`}></div>
                   <span className="font-bold text-sm tracking-wide">{agent.title}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-2 border-b border-white/10 pb-2">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0,2).map((cap, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/80">{cap}</span>
                    ))}
                </div>
              </div>

              {/* Icon Button */}
              <button
                onClick={() => onSelectAgent(agent)}
                className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-900"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${agent.color}`} />
                <Icon className="w-6 h-6 relative z-10" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Settings Button (Bottom) */}
      <div className="px-4">
        <button 
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center relative group"
            title="Configurações Globais"
        >
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
};
