
import React, { useState } from 'react';
import { Brain, Calendar, Target, ShieldCheck, LucideIcon, Settings, Zap } from 'lucide-react';
import { Agent, AgentRole } from '../types';

// Accent color per agent (monochromatic-safe subtle tones)
const AGENT_ACCENT: Record<string, string> = {
  strategist: '#818cf8', // indigo-400
  concierge:  '#fb7185', // rose-400
  hunter:     '#34d399', // emerald-400
  compliance: '#94a3b8', // slate-400
};

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
    color: 'bg-zinc-600',
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
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] bg-white z-[60] flex-col items-center py-5"
         style={{ borderRight: '1px solid #f4f4f5', boxShadow: '1px 0 0 0 rgba(0,0,0,0.03), 4px 0 24px rgba(0,0,0,0.018)' }}>

      {/* ── Brand Mark ── */}
      <div className="mb-7 shrink-0">
        <div className="w-9 h-9 bg-zinc-950 rounded-[10px] flex items-center justify-center shadow-lg overflow-hidden p-[7px] cursor-default"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.04) inset' }}>
          <img src="/assets/logo-white.svg" alt="Anova" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* ── AI Badge ── */}
      <div className="mb-5 flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-50 border border-zinc-100">
        <Zap className="w-2.5 h-2.5 text-zinc-400" />
        <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-zinc-400">AI</span>
      </div>

      {/* ── Agent Buttons ── */}
      <div className="flex flex-col items-center gap-1 w-full px-2.5 flex-1">
        {AGENTS.map((agent) => {
          const Icon = IconMap[agent.iconName];
          const accent = AGENT_ACCENT[agent.id];
          const isActive = activeId === agent.id;

          return (
            <div key={agent.id} className="relative w-full group/agent flex justify-center">

              {/* ── Tooltip ── */}
              <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 w-64 opacity-0 invisible group-hover/agent:opacity-100 group-hover/agent:visible translate-x-1 group-hover/agent:translate-x-0 transition-all duration-200 z-[200]">
                {/* Arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[6px] border-[5px] border-transparent"
                     style={{ borderRightColor: '#09090b' }} />
                {/* Card */}
                <div className="bg-zinc-950 rounded-xl p-4 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                         style={{ backgroundColor: accent + '22' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-tight">{agent.title}</p>
                      <p className="text-zinc-500 text-[9px] font-medium mt-0.5">{agent.name}</p>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed mb-3 pb-3 border-b border-white/[0.06]">
                    {agent.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((cap, i) => (
                      <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md text-zinc-400"
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-zinc-500 font-medium">Clique para abrir</span>
                  </div>
                </div>
              </div>

              {/* ── Button ── */}
              <button
                onClick={() => { onSelectAgent(agent); setActiveId(agent.id); }}
                className="agent-btn relative w-full flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl transition-all duration-200 overflow-hidden"
                style={isActive ? { backgroundColor: '#f4f4f5' } : {}}
                onMouseLeave={() => {}}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full opacity-0 group-hover/agent:opacity-100 transition-all duration-300"
                  style={{ backgroundColor: accent }}
                />

                {/* Icon wrapper */}
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 text-zinc-400 group-hover/agent:text-white group-hover/agent:shadow-lg"
                  style={{}}
                >
                  <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-zinc-100 group-hover/agent:bg-zinc-950 transition-all duration-200">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                </div>

                {/* Label */}
                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400 group-hover/agent:text-zinc-700 transition-colors duration-200 leading-none">
                  {agent.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="w-8 h-px bg-zinc-100 my-3 shrink-0" />

      {/* ── Settings ── */}
      <div className="w-full px-2.5 shrink-0 group/settings">
        <div className="relative flex justify-center">
          {/* Tooltip */}
          <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 invisible group-hover/settings:opacity-100 group-hover/settings:visible translate-x-1 group-hover/settings:translate-x-0 transition-all duration-200 z-[200]">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[6px] border-[5px] border-transparent"
                 style={{ borderRightColor: '#09090b' }} />
            <div className="bg-zinc-950 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
              <p className="text-white text-xs font-medium">Configurações</p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="agent-btn w-full flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl hover:bg-zinc-50 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-[10px] bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-200 transition-all duration-200">
              <Settings className="w-[18px] h-[18px] group-hover:rotate-[70deg] transition-transform duration-500" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400 group-hover:text-zinc-700 transition-colors duration-200 leading-none">
              Config
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
