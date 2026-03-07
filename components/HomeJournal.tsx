
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, TrendingUp, TrendingDown, ChevronLeft, ArrowUpRight, Building2, Wallet, MessageCircle, Mic, Play, Menu, User, LogOut, Settings, Zap, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Client, Priority, TriggerType, ViewContext, Metric, Agent, Notification } from '../types';
import { MetricOverlay } from './MetricOverlay';
import { AgentRail, AGENTS, IconMap } from './AgentRail';
import { AgentCommandCenter } from './AgentCommandCenter';
import { SettingsModal } from './SettingsModal';
// import { ClientRegistrationModal } from './ClientRegistrationModal'; // V2 - Modal de pré-cadastro desativado

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
  onRegisterClient?: () => void;
}

// --- Skeleton Components ---
const SkeletonCard = () => (
  <div className="snap-start shrink-0 w-[260px] md:w-[310px] h-[176px] bg-white rounded-xl border border-zinc-100 p-5 flex flex-col justify-between animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-zinc-100 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-zinc-100 rounded w-1/4" />
      <div className="h-3 bg-zinc-100 rounded w-full" />
      <div className="h-3 bg-zinc-100 rounded w-2/3" />
    </div>
  </div>
);

const SkeletonMetric = () => (
  <div className="snap-start bg-white p-5 rounded-xl border border-zinc-100 flex flex-col justify-between animate-pulse w-[220px] h-[140px]">
    <div className="flex justify-between items-start">
      <div className="h-3 bg-zinc-100 rounded w-1/2" />
      <div className="w-4 h-4 bg-zinc-100 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-7 bg-zinc-100 rounded w-3/4" />
      <div className="h-3 bg-zinc-100 rounded w-1/3" />
    </div>
  </div>
);

// --- Últimas Mensagens (desabilitado temporariamente - funcionalidade futura) ---
/*
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', clientId: '2', clientName: 'Ana Costa',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Bom dia! Pode me enviar a lâmina do fundo?', time: '10:42', isAudio: false
  },
  {
    id: 'n2', clientId: '1', clientName: 'Roberto Silva',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Áudio recebido (0:45)', time: '09:15', isAudio: true
  },
  {
    id: 'n3', clientId: '3', clientName: 'Carlos Mendes',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Reunião confirmada para amanhã?', time: 'Ontem', isAudio: false
  },
  {
    id: 'n4', clientId: '4', clientName: 'Fernanda Lima',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Documentos assinados.', time: 'Ontem', isAudio: false
  },
  {
    id: 'n5', clientId: '5', clientName: 'Ricardo Souza',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Qual a previsão do IPCA?', time: 'Terça', isAudio: false
  },
  {
    id: 'n6', clientId: '6', clientName: 'Patrícia Abravanel',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Áudio recebido (1:20)', time: 'Segunda', isAudio: true
  },
  {
    id: 'n7', clientId: '7', clientName: 'Lucas Pereira',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Obrigado pelo relatório!', time: 'Segunda', isAudio: false
  },
  {
    id: 'n8', clientId: '8', clientName: 'Juliana Paes',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Vamos marcar um almoço.', time: 'Dom', isAudio: false
  },
  {
    id: 'n9', clientId: '9', clientName: 'Marcos Mion',
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-a29896667052?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Aporte realizado.', time: 'Sab', isAudio: false
  },
  {
    id: 'n10', clientId: '10', clientName: 'Beatriz Reis',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    message: 'Preciso resgatar 50k.', time: 'Sex', isAudio: false
  }
];
*/


// --- Sub-component: Client Card ---
const ClientCard: React.FC<{ client: Client; onClick: () => void }> = ({ client, onClick }) => {
  const getTagStyle = () => {
    if (client.carteira) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    switch (client.mainTrigger.type) {
      case TriggerType.CHURN: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className="snap-start shrink-0 w-[260px] md:w-[310px] h-[176px] relative group cursor-pointer"
    >
      <div className="w-full h-full bg-white rounded-xl border border-zinc-100 overflow-hidden flex flex-col justify-between p-5 transition-all duration-300 group-hover:border-zinc-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] group-hover:-translate-y-px">

        {/* Priority dot */}
        {client.mainTrigger.priority === Priority.HIGH && (
          <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-red-500 rounded-full ring-[3px] ring-red-50" />
        )}

        {/* Top: Avatar & Info */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 transition-colors duration-200 group-hover:bg-zinc-200">
            <User className="w-4 h-4" />
          </div>
          <div className="mt-0.5 min-w-0">
            <h3 className="font-semibold text-zinc-900 text-sm leading-tight tracking-tight truncate">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-zinc-500">{client.aum}</p>
              {client.conta && (
                <span className="text-[9px] text-zinc-400 font-mono bg-zinc-50 px-1 py-px rounded border border-zinc-100">
                  #{client.conta}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Trigger */}
        <div className="space-y-2">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${getTagStyle()}`}>
            {client.carteira || client.mainTrigger.type}
          </span>
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
            {client.mainTrigger.description}
          </p>
        </div>
      </div>
    </div>
  );
};


// --- Sub-component: Client Rail ---
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
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -360 : 360,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-2 group/rail relative">
      <div className="flex items-center justify-between px-4 md:px-12 mb-4 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="text-zinc-400">{icon}</div>
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
            {title}
          </h2>
          <span className="text-xs text-zinc-400 font-mono bg-zinc-100 px-1.5 py-0.5 rounded-md">
            {clients.length}
          </span>
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider hover:bg-zinc-800 active:scale-95 transition-all duration-150 shadow-sm"
          >
            Cadastrar Cliente
          </button>
        )}
      </div>

      {/* Scroll buttons */}
      <div className="absolute top-[62%] -translate-y-1/2 left-3 z-20 opacity-0 group-hover/rail:opacity-100 transition-all duration-200 hidden md:block">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-white shadow-md border border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:shadow-lg active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute top-[62%] -translate-y-1/2 right-3 z-20 opacity-0 group-hover/rail:opacity-100 transition-all duration-200 hidden md:block">
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-white shadow-md border border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:shadow-lg active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-12 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => onClientClick(client.id)}
            />
          ))}
          <div className="w-6 shrink-0 snap-start" />
        </div>

        {/* Fade masks */}
        <div className="hidden md:block absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-zinc-50 to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-zinc-50 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};


// --- Main Component ---
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
  userData,
  onRegisterClient,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // const [isRegistrationOpen, setIsRegistrationOpen] = useState(false); // V2 - modal de pré-cadastro desativado
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollMetrics = (direction: 'left' | 'right') => {
    if (metricsRef.current) {
      const width = metricsRef.current.clientWidth;
      metricsRef.current.scrollBy({
        left: direction === 'left' ? -width * 0.85 : width * 0.85,
        behavior: 'smooth'
      });
    }
  };

  // --- scrollNotifications: desabilitado (funcionalidade futura) ---
  /*
  const scrollNotifications = (direction: 'up' | 'down') => {
    if (notificationsRef.current) {
      const height = 80;
      notificationsRef.current.scrollBy({
        top: direction === 'up' ? -height : height,
        behavior: 'smooth'
      });
    }
  };
  */

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mb-6 pt-6">
          <div className="flex items-center gap-2.5 px-4 md:px-12 mb-4">
            <div className="w-4 h-4 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 md:gap-4 px-4 md:px-12 overflow-hidden">
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
          icon={<User className="w-4 h-4" />}
          onAddClick={onRegisterClient}
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
              icon={<Wallet className="w-4 h-4" />}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={`
        h-[100dvh] flex bg-zinc-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isBlurred ? 'scale-[0.99] blur-sm brightness-[0.85] overflow-hidden' : 'scale-100 blur-0 brightness-100'}
    `}>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid #3f3f46',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
        }}
      />

      {/* Agent Rail */}
      <AgentRail onSelectAgent={setSelectedAgent} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* ── Mobile Sidebar Overlay ── */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 anim-fade-in"
            style={{ background: 'rgba(9,9,11,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-[80px] bg-white h-full flex flex-col items-center py-6 anim-slide-left"
               style={{ borderRight: '1px solid #f4f4f5', boxShadow: '4px 0 40px rgba(0,0,0,0.12)' }}>

            {/* Brand */}
            <div className="w-9 h-9 bg-zinc-950 rounded-[10px] flex items-center justify-center mb-7 shadow-lg overflow-hidden p-[7px]">
              <img src="/assets/logo-white.svg" alt="Anova" className="w-full h-full object-contain" />
            </div>

            {/* AI badge */}
            <div className="mb-5 flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-50 border border-zinc-100">
              <Zap className="w-2.5 h-2.5 text-zinc-400" />
              <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-zinc-400">AI</span>
            </div>

            {/* Agents */}
            <div className="flex flex-col items-center gap-1 w-full px-2.5 flex-1">
              {AGENTS.map((agent) => {
                const Icon = IconMap[agent.iconName];
                return (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent); setIsMobileSidebarOpen(false); }}
                    className="agent-btn w-full flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl group transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-200">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400 group-hover:text-zinc-700 transition-colors leading-none">
                      {agent.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-zinc-100 my-3" />

            {/* Settings */}
            <div className="w-full px-2.5">
              <button
                onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
                className="agent-btn w-full flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl group hover:bg-zinc-50 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-[10px] bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-200 transition-all duration-200">
                  <Settings className="w-[18px] h-[18px] group-hover:rotate-[70deg] transition-transform duration-500" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400 group-hover:text-zinc-700 transition-colors leading-none">Config</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:pl-[72px] h-screen overflow-y-auto bg-zinc-50">

        {/* ── Header ── */}
        <header className="header-in sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-100/80"
                style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}>
          <div className="px-4 md:px-10 h-16 flex items-center justify-between gap-4">

            {/* Left section */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 active:scale-95 transition-all duration-150"
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>

              {/* Logo — mobile only (desktop has it in sidebar) */}
              <div className="md:hidden h-6 flex items-center shrink-0">
                <img src="/assets/logo-dark.svg" alt="Anova" className="h-full object-contain" />
              </div>

              {/* Desktop: live status */}
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="relative flex h-2 w-2">
                  <span className="notif-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 tracking-wide">Ao vivo</span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 shrink-0">

              {/* ── Notification Bell ── */}
              <div className="relative group/bell">
                <button className="relative flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 active:scale-95 transition-all duration-150">
                  <Bell className="w-[17px] h-[17px]" />
                  {/* Animated ping badge */}
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="notif-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 border border-white" />
                  </span>
                </button>
                {/* Bell tooltip */}
                <div className="pointer-events-none absolute top-full right-0 mt-2 opacity-0 invisible group-hover/bell:opacity-100 group-hover/bell:visible transition-all duration-150 z-50">
                  <div className="bg-zinc-950 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                    <p className="text-white text-[11px] font-medium">1 notificação</p>
                  </div>
                </div>
              </div>

              {/* ── Separator ── */}
              <div className="w-px h-5 bg-zinc-100 mx-1" />

              {/* ── User Section ── */}
              <div className="flex items-center gap-2">
                {/* Avatar with initials */}
                {(() => {
                  const initials = userData?.nome
                    ? userData.nome.trim().split(/\s+/).slice(0, 2).map((n: string) => n[0].toUpperCase()).join('')
                    : '?';
                  return (
                    <div className="avatar-initials w-8 h-8 rounded-[9px] flex items-center justify-center text-white text-[11px] font-bold tracking-wide shrink-0 select-none"
                         title={userData?.nome || ''}>
                      {initials}
                    </div>
                  );
                })()}

                {/* Name — visible on sm+ */}
                {userData?.nome && (
                  <span className="hidden sm:block text-[13px] font-medium text-zinc-700 max-w-[140px] truncate leading-none">
                    {userData.nome.split(' ')[0]}
                  </span>
                )}

                {/* Logout */}
                <div className="relative group/logout">
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150 group"
                  >
                    <LogOut className="w-[15px] h-[15px] group-hover:-translate-x-0.5 transition-transform duration-150" />
                  </button>
                  <div className="pointer-events-none absolute top-full right-0 mt-2 opacity-0 invisible group-hover/logout:opacity-100 group-hover/logout:visible transition-all duration-150 z-50">
                    <div className="bg-zinc-950 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                      <p className="text-white text-[11px] font-medium">Sair da conta</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </header>

        <div className="flex flex-col">

          {/* Hero Section: Search + Metrics */}
          <section className="px-4 md:px-12 pt-8 pb-10 border-b border-zinc-100 bg-white">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">

              {/* LEFT: Title + Search */}
              <div className="lg:w-5/12 flex flex-col justify-center min-w-0">

                {/* Date badge */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.15em] capitalize">
                    {today}
                  </span>
                </div>

                <h1 className="text-3xl md:text-[2.25rem] font-serif text-zinc-900 mb-2 tracking-tight leading-tight">
                  Jornal do <span className="text-zinc-400 italic">Consultor</span>
                </h1>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed max-w-xs">
                  Visão diária consolidada. Monitore riscos e oportunidades em tempo real.
                </p>

                {/* Search Bar */}
                <div className="relative w-full" ref={searchRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { onSearchChange(e.target.value); setIsSearchOpen(true); }}
                      onFocus={() => setIsSearchOpen(true)}
                      className="block w-full pl-11 pr-11 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 focus:border-zinc-400 focus:bg-white transition-all text-sm"
                      placeholder="Buscar por cliente, conta ou carteira..."
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => { onSearchChange(''); setIsSearchOpen(false); }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                        aria-label="Limpar busca"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Search Dropdown */}
                  {isSearchOpen && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-100 overflow-hidden z-[60] max-h-72 overflow-y-auto anim-slide-down">
                      {clients.length > 0 ? clients.map(client => (
                        <div
                          key={client.id}
                          onClick={() => { onSelectClient(client.id); setIsSearchOpen(false); }}
                          className="px-4 py-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-3 border-b border-zinc-50 last:border-0 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-semibold text-zinc-900 text-sm truncate">{client.name}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider truncate">{client.carteira}</p>
                              {client.conta && (
                                <span className="text-[10px] text-zinc-400 font-mono shrink-0">#{client.conta}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-5 text-center text-sm text-zinc-400">Nenhum cliente encontrado.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* --- Últimas Mensagens (desabilitado — funcionalidade futura) ---
                <div className="mt-8 flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Últimas Mensagens</h3>
                </div>
                <div className="space-y-2.5">
                  {MOCK_NOTIFICATIONS.slice(0, 3).map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => onSelectClient(notification.clientId, 'Mensageria')}
                      className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex items-start gap-3 cursor-pointer hover:border-zinc-300 hover:bg-white transition-all group"
                    >
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center">
                          <MessageCircle className="w-1.5 h-1.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-semibold text-zinc-900 truncate">{notification.clientName}</h4>
                          <span className="text-[10px] text-zinc-400 shrink-0 ml-2">{notification.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                */}
              </div>

              {/* RIGHT: Performance Metrics */}
              <div className="lg:w-7/12 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Indicadores de Performance</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Clique em um indicador para mais detalhes</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => scrollMetrics('left')} className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:border-zinc-300 active:scale-95 transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => scrollMetrics('right')} className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:border-zinc-300 active:scale-95 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div
                    ref={metricsRef}
                    className="grid grid-rows-2 grid-flow-col gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1"
                    style={{ height: '308px' }}
                  >
                    {isLoading ? (
                      [1, 2, 3, 4, 5, 6].map(i => <SkeletonMetric key={i} />)
                    ) : metrics.map((metric) => (
                      <div
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric)}
                        className="snap-start shrink-0 w-[220px] h-[146px] p-5 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-950 hover:border-zinc-950 hover:shadow-2xl hover:shadow-zinc-900/20 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                      >
                        {metric.isMock && (
                          <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-zinc-100 group-hover:bg-zinc-800 text-[8px] font-bold text-zinc-400 group-hover:text-zinc-500 uppercase tracking-tighter rounded-bl border-l border-b border-zinc-200 group-hover:border-zinc-700 transition-all z-20">
                            Mock
                          </div>
                        )}

                        <div className="flex justify-between items-start">
                          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors truncate pr-4">
                            {metric.label}
                          </h3>
                          <div className="text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0">
                            {metric.id === 'custody' ? <Building2 className="w-3.5 h-3.5" /> :
                              metric.id === 'net_new' ? <Wallet className="w-3.5 h-3.5" /> :
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            }
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="text-2xl font-serif font-medium text-zinc-900 group-hover:text-white tracking-tight transition-colors duration-300">
                            {metric.value}
                          </div>
                          <div className={`inline-flex items-center gap-1 mt-1 text-xs font-medium transition-colors duration-300 ${
                            metric.trendDirection === 'up'
                              ? 'text-emerald-600 group-hover:text-emerald-400'
                              : metric.trendDirection === 'down'
                              ? 'text-red-600 group-hover:text-red-400'
                              : 'text-zinc-500 group-hover:text-zinc-500'
                          }`}>
                            {metric.trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                            {metric.trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                            {metric.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fade mask right */}
                  <div className="absolute top-0 bottom-1 right-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Client Rails */}
        <div className="flex-none relative bg-zinc-50 pb-40">
          <div className="space-y-0 anim-slide-up">
            {renderContent()}
          </div>
        </div>

      </div>

      {/* Metric Overlay */}
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

      {/* Client Registration Modal - V2 (desativado - substituído pela página de cadastro direto) */}
      {/* <ClientRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        userData={userData}
        onSave={(data) => {
          console.log('Saving client data:', data);
          toast.success('Cliente cadastrado com sucesso!');
        }}
      /> */}

    </div>
  );
};
