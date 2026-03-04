
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, AlertCircle, TrendingUp, TrendingDown, ShieldAlert, PieChart, Sparkles, ChevronLeft, MoreHorizontal, ArrowUpRight, Clock, FileSignature, Building2, Wallet, MessageCircle, Mic, Play, MoreVertical, ChevronUp, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Client, Priority, TriggerType, ViewContext, Metric, Agent, Notification } from '../types';
import { MetricOverlay } from './MetricOverlay';
import { AgentRail, AGENTS, IconMap } from './AgentRail';
import { AgentCommandCenter } from './AgentCommandCenter';
import { SettingsModal } from './SettingsModal';

import { ClientRegistrationModal } from './ClientRegistrationModal';

interface HomeJournalProps {
  clients: Client[];
  allClients: Client[];
  metrics: Metric[];
  viewContext: ViewContext;
  isBlurred: boolean;
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectClient: (id: string, section?: string) => void;
  onLogout: () => void;
  userData: any;
}

// --- Skeleton Components ---
const SkeletonCard = () => (
  <div className="snap-start shrink-0 w-[280px] md:w-[340px] h-[180px] md:h-[200px] bg-white rounded-xl border border-zinc-100 p-6 flex flex-col justify-between animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-zinc-100" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-zinc-100 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-zinc-100 rounded w-1/4" />
      <div className="h-3 bg-zinc-100 rounded w-full" />
    </div>
  </div>
);

const SkeletonMetric = () => (
  <div className="snap-start bg-white p-5 rounded-xl border border-zinc-100 flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-start">
      <div className="h-3 bg-zinc-100 rounded w-1/2" />
      <div className="w-4 h-4 bg-zinc-100 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-8 bg-zinc-100 rounded w-3/4" />
      <div className="h-3 bg-zinc-100 rounded w-1/3" />
    </div>
  </div>
);

// --- Mock Notifications ---
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        clientId: '2',
        clientName: 'Ana Costa',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Bom dia! Pode me enviar a lâmina do fundo?',
        time: '10:42',
        isAudio: false
    },
    {
        id: 'n2',
        clientId: '1',
        clientName: 'Roberto Silva',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Áudio recebido (0:45)',
        time: '09:15',
        isAudio: true
    },
    {
        id: 'n3',
        clientId: '3',
        clientName: 'Carlos Mendes',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Reunião confirmada para amanhã?',
        time: 'Ontem',
        isAudio: false
    },
    {
        id: 'n4',
        clientId: '4',
        clientName: 'Fernanda Lima',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Documentos assinados.',
        time: 'Ontem',
        isAudio: false
    },
    {
        id: 'n5',
        clientId: '5',
        clientName: 'Ricardo Souza',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Qual a previsão do IPCA?',
        time: 'Terça',
        isAudio: false
    },
    {
        id: 'n6',
        clientId: '6',
        clientName: 'Patrícia Abravanel',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Áudio recebido (1:20)',
        time: 'Segunda',
        isAudio: true
    },
    {
        id: 'n7',
        clientId: '7',
        clientName: 'Lucas Pereira',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Obrigado pelo relatório!',
        time: 'Segunda',
        isAudio: false
    },
    {
        id: 'n8',
        clientId: '8',
        clientName: 'Juliana Paes',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Vamos marcar um almoço.',
        time: 'Dom',
        isAudio: false
    },
    {
        id: 'n9',
        clientId: '9',
        clientName: 'Marcos Mion',
        avatarUrl: 'https://images.unsplash.com/photo-1552058544-a29896667052?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Aporte realizado.',
        time: 'Sab',
        isAudio: false
    },
    {
        id: 'n10',
        clientId: '10',
        clientName: 'Beatriz Reis',
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Preciso resgatar 50k.',
        time: 'Sex',
        isAudio: false
    }
];


// --- Sub-component: Client Card (The "Movie Thumbnail") ---
const ClientCard: React.FC<{ client: Client; onClick: () => void }> = ({ client, onClick }) => {
  const getTagStyle = () => {
    if (client.carteira) return 'bg-red-50 text-red-800 border-red-100';
    switch (client.mainTrigger.type) {
      case TriggerType.PENSION: return 'bg-rose-50 text-rose-800 border-rose-100';
      case TriggerType.CHURN: return 'bg-red-50 text-red-800 border-red-100';
      case TriggerType.REBALANCE: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case TriggerType.VARIABLE_INCOME: return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      default: return 'bg-white text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="snap-start shrink-0 w-[280px] md:w-[340px] h-[180px] md:h-[200px] relative group cursor-pointer transition-all duration-500 z-0 hover:z-10 hover:-translate-y-1"
    >
      <div className="w-full h-full bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-zinc-100 overflow-hidden relative group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] group-hover:border-zinc-300 transition-all p-4 md:p-6 flex flex-col justify-between">
        
        {/* Priority Indicator Dot */}
        {client.mainTrigger.priority === Priority.HIGH && (
           <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full shadow-sm ring-4 ring-red-50" />
        )}

        {/* Top: Avatar & Info */}
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 group-hover:bg-zinc-200 transition-colors">
                <User className="w-6 h-6" />
            </div>
            <div className="mt-0.5">
              <h3 className="font-bold text-zinc-900 text-base leading-tight font-serif tracking-tight">{client.name}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-zinc-500 font-medium">{client.aum}</p>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                  {client.conta ? `#${client.conta}` : 'sem conta'}
                </span>
              </div>
            </div>
        </div>

        {/* Bottom: Trigger Context */}
        <div className="space-y-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getTagStyle()}`}>
                {client.carteira || client.mainTrigger.type}
            </span>
            <p className="text-sm text-zinc-600 leading-snug line-clamp-2">
                {client.mainTrigger.description}
            </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: Client Rail (The "Swimlane") ---
const ClientRail: React.FC<{ 
  title: string; 
  clients: Client[]; 
  onClientClick: (id: string) => void; 
  icon?: React.ReactNode;
  onAddClick?: () => void;
}> = ({ title, clients, onClientClick, icon, onAddClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (clients.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400; // Approx one card + gap
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-6 group/rail relative">
      <div className="flex items-center justify-between px-4 md:px-12 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-zinc-900 opacity-80">{icon}</div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight font-serif">
            {title}
          </h2>
        </div>
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all shadow-sm"
          >
            Cadastrar Cliente
          </button>
        )}
      </div>
      
      <div className="absolute top-[60%] -translate-y-1/2 left-4 z-20 opacity-0 group-hover/rail:opacity-100 transition-all duration-300 hidden md:block">
        <button 
          onClick={() => scroll('left')}
          className="p-3 rounded-full bg-white shadow-lg border border-zinc-100 text-zinc-600 hover:text-zinc-900 hover:scale-105 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-[60%] -translate-y-1/2 right-4 z-20 opacity-0 group-hover/rail:opacity-100 transition-all duration-300 hidden md:block">
        <button 
          onClick={() => scroll('right')}
          className="p-3 rounded-full bg-white shadow-lg border border-zinc-100 text-zinc-600 hover:text-zinc-900 hover:scale-105 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative group/scroll">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-12 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {clients.map((client) => (
            <ClientCard 
                key={client.id} 
                client={client} 
                onClick={() => onClientClick(client.id)} 
            />
          ))}
          <div className="w-8 shrink-0 snap-start" />
        </div>
        
        <div className="hidden md:block absolute left-0 top-0 bottom-6 w-16 bg-gradient-to-r from-zinc-50 to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-zinc-50 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

export const HomeJournal: React.FC<HomeJournalProps> = ({ 
  clients, 
  allClients, 
  metrics, 
  viewContext, 
  isBlurred, 
  isLoading,
  searchQuery,
  onSearchChange,
  onSelectClient, 
  onLogout,
  userData
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollMetrics = (direction: 'left' | 'right') => {
    if (metricsRef.current) {
        const width = metricsRef.current.clientWidth;
        const scrollAmount = width * 0.9; 
        metricsRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const scrollNotifications = (direction: 'up' | 'down') => {
    if (notificationsRef.current) {
        const height = 80; // Approx item height
        notificationsRef.current.scrollBy({
            top: direction === 'up' ? -height : height,
            behavior: 'smooth'
        });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mb-6">
          <div className="flex items-center gap-3 px-4 md:px-12 mb-4">
            <div className="w-5 h-5 bg-zinc-200 rounded animate-pulse" />
            <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 md:gap-6 px-4 md:px-12 overflow-hidden">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      );
    }

    const normalizePortfolio = (name: string | undefined): string => {
      if (!name) return 'Outras Carteiras';
      const n = name.toLowerCase().trim();
      if (n.includes('start')) return 'Start';
      if (n.includes('personalizada')) return 'Carteira Personalizada';
      if (n.includes('renda fixa')) return 'Renda Fixa';
      if (n.includes('strategy')) return 'Strategy';
      if (n.includes('prev pro usa')) return 'Prev Pro USA';
      return 'Outras Carteiras';
    };

    const MAIN_ORDER = [
      'Carteira Personalizada',
      'Renda Fixa',
      'Strategy',
      'Start',
      'Prev Pro USA',
      'Outras Carteiras'
    ];

    // Group current (filtered) clients by normalized portfolio
    const grouped = clients.reduce((acc, client) => {
      const normalized = normalizePortfolio(client.carteira);
      if (!acc[normalized]) acc[normalized] = [];
      acc[normalized].push(client);
      return acc;
    }, {} as Record<string, Client[]>);
    
    return (
      <>
        <ClientRail 
          title="Clientes Cadastrados" 
          clients={clients} 
          onClientClick={onSelectClient} 
          icon={<User className="w-5 h-5 text-zinc-900" />} 
          onAddClick={() => setIsRegistrationOpen(true)}
        />
        {MAIN_ORDER.map(portfolio => {
          const portfolioClients = grouped[portfolio];
          if (!portfolioClients || portfolioClients.length === 0) return null;
          return (
            <ClientRail 
              key={portfolio}
              title={`Carteira: ${portfolio}`} 
              clients={portfolioClients} 
              onClientClick={onSelectClient} 
              icon={<Wallet className="w-5 h-5 text-zinc-900" />} 
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={`
        h-[100dvh] flex bg-zinc-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isBlurred ? 'scale-[0.98] blur-sm brightness-[0.8] overflow-hidden' : 'scale-100 blur-0 brightness-100'}
    `}>
      
      {/* 1. AGENT RAIL (Sidebar) */}
      <AgentRail onSelectAgent={setSelectedAgent} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative w-20 bg-white h-full flex flex-col items-center py-8 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-12 shadow-lg overflow-hidden p-2">
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
                        <button
                            key={agent.id}
                            onClick={() => {
                                setSelectedAgent(agent);
                                setIsMobileSidebarOpen(false);
                            }}
                            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center"
                        >
                            <Icon className="w-6 h-6" />
                        </button>
                    );
                })}
            </div>
            <button 
                onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileSidebarOpen(false);
                }}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center"
            >
                <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:pl-20 h-screen overflow-y-auto bg-zinc-50">
        
        {/* Header - Sticky */}
        <header className="sticky top-0 bg-zinc-50/80 backdrop-blur-md z-50 px-4 md:px-12 h-16 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    <div className="h-8 flex items-center">
                        <img 
                          src="/assets/logo-dark.svg" 
                          alt="Anova Logo" 
                          className="h-full object-contain"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button className="relative group">
                        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-zinc-50"></span>
                    </button>
                    
                    <div className="flex items-center gap-3 pl-6 border-l border-zinc-100">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                            <User className="w-4 h-4" />
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all text-xs font-bold uppercase tracking-wider group"
                        >
                            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Sair
                        </button>
                    </div>
                </div>
        </header>

        <div className="flex flex-col">
            {/* SECTION 1: Context, Search & Metrics */}
            <section className="px-4 md:px-12 pt-8 pb-12 border-b border-zinc-100 bg-white">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* LEFT: Title, Search & Messages */}
                    <div className="lg:w-5/12 flex flex-col min-w-0">
                        <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 mb-2 tracking-tight leading-tight">
                            Jornal do <span className="text-zinc-400 italic">Consultor</span>
                        </h1>
                        <p className="text-zinc-500 mb-6 text-sm leading-relaxed max-w-xl">
                            Visão diária consolidada. Monitore riscos e oportunidades em tempo real.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative group w-full mb-8" ref={searchRef}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        onSearchChange(e.target.value);
                                        setIsSearchOpen(true);
                                    }}
                                    onFocus={() => setIsSearchOpen(true)}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all text-sm"
                                    placeholder="Buscar por cliente, conta ou carteira..."
                                />
                            </div>
                            
                            {/* Search Dropdown */}
                            {isSearchOpen && searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[60] max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 text-left">
                                    {clients.length > 0 ? clients.map(client => (
                                        <div 
                                            key={client.id}
                                            onClick={() => {
                                                onSelectClient(client.id);
                                                setIsSearchOpen(false);
                                            }}
                                            className="px-6 py-4 hover:bg-zinc-50 cursor-pointer flex items-center gap-4 border-b border-zinc-50 last:border-0 group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-bold text-zinc-900 text-base">{client.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{client.carteira}</p>
                                                    <span className="text-xs text-zinc-400 font-mono">
                                                        {client.conta ? `#${client.conta}` : 'sem conta'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center text-sm text-zinc-500">Nenhum cliente encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Notifications Area */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Últimas Mensagens</h3>
                        </div>
                        <div className="space-y-3">
                            {MOCK_NOTIFICATIONS.slice(0, 3).map(notification => (
                                <div 
                                    key={notification.id}
                                    onClick={() => onSelectClient(notification.clientId, 'Mensageria')}
                                    className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex items-start gap-3 cursor-pointer hover:border-zinc-300 hover:bg-white transition-all group"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                                            <MessageCircle className="w-1.5 h-1.5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-xs font-bold text-zinc-900 truncate">{notification.clientName}</h4>
                                            <span className="text-[10px] text-zinc-400">{notification.time}</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{notification.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Performance Metrics Carousel */}
                    <div className="lg:w-7/12 flex flex-col min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 font-serif tracking-tight">Indicadores de Performance</h2>
                            <div className="flex gap-1.5">
                                <button onClick={() => scrollMetrics('left')} className="p-2 bg-zinc-50 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => scrollMetrics('right')} className="p-2 bg-zinc-50 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative group/metrics">
                            <div 
                                ref={metricsRef}
                                className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-2 h-[340px]"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <style>{`
                                    .no-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                                
                                {isLoading ? (
                                    [1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="shrink-0 w-[240px] h-[150px] bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                                    ))
                                ) : metrics.map((metric) => (
                                    <div 
                                        key={metric.id}
                                        onClick={() => setSelectedMetric(metric)}
                                        className="snap-start shrink-0 w-[240px] h-[150px] bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:bg-white hover:shadow-xl hover:shadow-zinc-900/5 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                                    >
                                        {metric.isMock && (
                                            <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-tighter rounded-bl border-l border-b border-zinc-200 z-20">
                                                Mock
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors truncate pr-4">
                                                {metric.label}
                                            </h3>
                                            <div className="text-zinc-300 group-hover:text-zinc-900 transition-colors">
                                                {metric.id === 'custody' ? <Building2 className="w-4 h-4" /> :
                                                    metric.id === 'net_new' ? <Wallet className="w-4 h-4" /> :
                                                    <ArrowUpRight className="w-4 h-4" />
                                                }
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="text-2xl font-serif font-medium text-zinc-900 tracking-tight">
                                                {metric.value}
                                            </div>
                                            <div className={`inline-flex items-center gap-1 mt-1 text-xs font-medium ${
                                                metric.trendDirection === 'up' ? 'text-emerald-600' : 
                                                metric.trendDirection === 'down' ? 'text-red-600' : 'text-zinc-500'
                                            }`}>
                                                {metric.trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                                                {metric.trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                                                {metric.trend}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Fade Mask Right */}
                            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
                        </div>
                    </div>
                </div>
            </section>

        </div>

        {/* Scrollable Body Area (Swimlanes) */}
        <div className="flex-none relative bg-zinc-50 pb-40">
            <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
                {renderContent()}
            </div>
        </div>

      </div>

      {/* Metrics Overlay */}
      {selectedMetric && (
        <MetricOverlay 
            metric={selectedMetric} 
            onClose={() => setSelectedMetric(null)} 
            onSelectClient={onSelectClient}
        />
      )}

      {/* Agent Command Center */}
      {selectedAgent && (
          <AgentCommandCenter 
              agent={selectedAgent} 
              onClose={() => setSelectedAgent(null)} 
          />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Client Registration Modal */}
      <ClientRegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)}
        userData={userData}
        onSave={(data) => {
          console.log('Saving client data:', data);
        }}
      />

    </div>
  );
};
