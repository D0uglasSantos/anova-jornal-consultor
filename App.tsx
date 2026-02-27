
import React, { useState, useMemo, useEffect } from 'react';
import { HomeJournal } from './components/HomeJournal';
import { ClientOverlay } from './components/ClientOverlay';
import { DockMenu } from './components/DockMenu';
import { LoginPage } from './components/LoginPage';
import { Client, RiskProfile, TriggerType, Priority, ViewContext, Metric } from './types';
import { apiRequest } from './services/api';
import { INITIAL_METRICS } from './constants';

// --- Mock Data Generator ---

const NAMES = [
  "Lucas", "Mariana", "Pedro", "Sofia", "Rafael", "Camila", "Gustavo", "Larissa", "Thiago", "Amanda", 
  "Felipe", "Beatriz", "Rodrigo", "Isabela", "Bruno", "Carolina", "Diego", "Fernanda", "Gabriel", "Helena",
  "Arthur", "Manuela", "Bernardo", "Alice", "Heitor", "Laura", "Davi", "Valentina", "Lorenzo", "Sophia",
  "Théo", "Lívia", "Enzo", "Maria", "Matheus", "Julia", "Nicolas", "Lorena", "Caio", "Giovanna"
];

const SURNAMES = [
  "Almeida", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Ferreira", "Costa", "Rodrigues", "Gomes", 
  "Martins", "Araujo", "Barbosa", "Ribeiro", "Carvalho", "Mendes", "Nunes", "Cavalcanti", "Cardoso", "Dias"
];

const AVATAR_IDS = [
  "1599566150163-29194dcaad36", "1494790108377-be9c29b29330", "1535713875002-d1d0cf377fde", 
  "1527980965255-d3b416303d12", "1580489944761-15a19d654956", "1633332755192-727a05c4013d",
  "1531427186611-ecfd6d936c79", "1507003211169-0a1dd7228f2d", "1500648767791-00dcc994a43e",
  "1534528741775-53994a69daeb", "1506794778202-cad84cf45f1d", "1544005313-94ddf0286df2",
  "1552058544-a29896667052", "1542206391-7f961081a1a3", "1521119989659-a83faa487663",
  "1531123897727-8f129e1688ce", "1560250097-0b93528c311a", "1573496359142-b8d87734a5a2",
  "1519085360753-af0119f7cbe7", "1492562080023-ab3db95bfbce"
];

const DESCRIPTIONS = {
  [TriggerType.PENSION]: [
    "Aporte pendente para teto fiscal (PGBL).",
    "Estudo de sucessão patrimonial pendente.",
    "Portabilidade de fundo de previdência recomendada.",
    "Aumentar contribuição mensal para atingir meta.",
    "Revisão de tabela tributária (Regressiva vs Progressiva)."
  ],
  [TriggerType.CHURN]: [
    "NPS Detrator na última pesquisa.",
    "Sem contato há mais de 45 dias.",
    "Saque relevante solicitado recentemente.",
    "Reclamação sobre rentabilidade da carteira.",
    "Cliente mencionou concorrente em última call."
  ],
  [TriggerType.REBALANCE]: [
    "Exposição em RV acima de 15% após alta da bolsa.",
    "Carteira desbalanceada em 20% vs modelo.",
    "Caixa acima do recomendado pela política.",
    "Ajuste tático necessário em Multimercados.",
    "Desenquadramento de perfil de risco."
  ],
  [TriggerType.FIXED_INCOME]: [
    "Vencimento de título público em 15 dias.",
    "Oportunidade em crédito privado High Grade.",
    "Novas emissões de CRA disponíveis.",
    "LCI com vencimento na próxima semana.",
    "Marcação a mercado favorável para venda antecipada."
  ],
  [TriggerType.VARIABLE_INCOME]: [
    "Oportunidade de entrada em Small Caps.",
    "Alta volatilidade em carteira de ações. Sugerir hedge.",
    "Aporte em oferta pública (IPO/Follow-on).",
    "Recomendação de venda de ativo estressado.",
    "Troca de ETF setorial recomendada."
  ],
  [TriggerType.LIQUIDITY]: [
    "Excesso de caixa disponível para alocação.",
    "Reserva de emergência precisa ser recomposta."
  ]
};

const generateClients = (): Client[] => {
  const baseClients: Client[] = [
    {
      id: '1',
      name: 'Roberto Silva',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      age: 58,
      profile: RiskProfile.MODERATE,
      lifeStage: 'Pré-Aposentadoria',
      aum: 'R$ 2.4M',
      mainTrigger: {
        type: TriggerType.PENSION,
        priority: Priority.HIGH,
        description: 'Aporte de R$ 12.500 pendente para teto fiscal (PGBL).',
        date: '2023-10-24'
      }
    },
    {
      id: '2',
      name: 'Ana Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      age: 34,
      profile: RiskProfile.AGGRESSIVE,
      lifeStage: 'Construção de Patrimônio',
      aum: 'R$ 850k',
      mainTrigger: {
        type: TriggerType.CHURN,
        priority: Priority.HIGH,
        description: 'NPS Detrator na última pesquisa. Sem contato há 45 dias.',
        date: '2023-10-22'
      }
    }
  ];

  const generatedClients: Client[] = [];
  let idCounter = 100;

  // Helper to generate a batch of clients for a specific trigger type
  const generateBatch = (count: number, forcedType?: TriggerType) => {
    for (let i = 0; i < count; i++) {
      const name = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`;
      const avatarId = AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)];
      const type = forcedType || Object.values(TriggerType)[Math.floor(Math.random() * 5)]; // Pick random trigger if not forced
      const descriptions = DESCRIPTIONS[type as TriggerType] || DESCRIPTIONS[TriggerType.LIQUIDITY];
      
      // Randomize Priority with weight towards High/Medium
      const randPrio = Math.random();
      const priority = randPrio > 0.6 ? Priority.HIGH : (randPrio > 0.3 ? Priority.MEDIUM : Priority.LOW);

      generatedClients.push({
        id: (idCounter++).toString(),
        name,
        avatarUrl: `https://images.unsplash.com/photo-${avatarId}?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
        age: 25 + Math.floor(Math.random() * 50),
        profile: Object.values(RiskProfile)[Math.floor(Math.random() * 3)],
        lifeStage: ['Acumulação', 'Construção', 'Aposentadoria', 'Blindagem', 'Expansão'][Math.floor(Math.random() * 5)],
        aum: `R$ ${(Math.random() * 5 + 0.1).toFixed(1)}M`,
        mainTrigger: {
          type,
          priority,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          date: '2023-10-28'
        }
      });
    }
  };

  // Ensure minimum count per category (at least 12 each to be safe)
  generateBatch(12, TriggerType.PENSION);
  generateBatch(12, TriggerType.CHURN);
  generateBatch(12, TriggerType.REBALANCE);
  generateBatch(12, TriggerType.FIXED_INCOME);
  generateBatch(12, TriggerType.VARIABLE_INCOME);
  
  // Add some randomness
  generateBatch(15); 

  return [...baseClients, ...generatedClients];
};

export default function App() {
  // -- State --
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [viewContext, setViewContext] = useState<ViewContext>('ALL');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // -- Auth Guard / Persistence --
  useEffect(() => {
    const savedSession = localStorage.getItem('anova_user_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setUserData(parsedSession);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('anova_user_session');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const handleLoginSuccess = (data: any) => {
    setUserData(data);
    setIsLoggedIn(true);
    localStorage.setItem('anova_user_session', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setMetrics(INITIAL_METRICS);
    setClients([]);
    setSelectedClientId(null);
    localStorage.removeItem('anova_user_session');
  };

  // -- Fetch Dashboard Data --
  useEffect(() => {
    if (isLoggedIn && userData?.username) {
      setIsLoadingData(true);
      const fetchDashboardData = async () => {
        try {
          const data = await apiRequest('/get_dados_home_anova', {
            method: 'POST',
            body: JSON.stringify({ email: userData.username }),
          });

          if (data) {
            setMetrics(prevMetrics => {
              return prevMetrics.map(metric => {
                let newValue = metric.value;
                let newHistory = metric.history;
                let isMock = true;

                if (metric.id === 'custody' && data.pl_admin !== undefined) {
                  newValue = `R$ ${(data.pl_admin / 1000000).toFixed(1)}M`;
                  isMock = false;
                  if (data.aum) {
                    newHistory = data.aum
                      .filter((item: any) => item.mes !== '1970-01')
                      .map((item: any) => 
                        typeof item.valor_aum === 'object' ? item.valor_aum.parsedValue : item.valor_aum
                      ).slice(-8);
                  }
                } else if (metric.id === 'pending' && data.contratos_pendentes !== undefined) {
                  newValue = `${data.contratos_pendentes} Docs`;
                  isMock = false;
                } else if (metric.id === 'roa' && data.taxa_adm !== undefined) {
                  newValue = `${data.taxa_adm}%`;
                  isMock = false;
                } else if (metric.id === 'clients' && data.clientes_ativos !== undefined) {
                  newValue = data.clientes_ativos.toString();
                  isMock = false;
                  if (data.hist_clientes) {
                    newHistory = data.hist_clientes
                      .filter((item: any) => item.mes !== '1970-01')
                      .map((item: any) => item.quantidade_clientes).slice(-8);
                  }
                } else if (metric.id === 'net_new' && data.captacao_mes !== undefined) {
                  const val = typeof data.captacao_mes === 'object' ? data.captacao_mes.parsedValue : data.captacao_mes;
                  newValue = `R$ ${(val / 1000000).toFixed(1)}M`;
                  isMock = false;
                } else if (metric.id === 'maturities' && data.vencimentos !== undefined) {
                  newValue = `R$ ${(data.vencimentos / 1000000).toFixed(1)}M`;
                  isMock = false;
                }

                return {
                  ...metric,
                  value: newValue,
                  history: newHistory,
                  isMock: isMock
                };
              });
            });
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };

      const fetchClients = async () => {
        try {
          const clientData = await apiRequest('/get_clientes_cadastrados', {
            method: 'POST',
            body: JSON.stringify({
              email: userData.username,
              id_partner: userData.id_partner,
              perfil_acesso: userData.perfil_acesso,
              id_registro: userData.id_registro,
              tipo_partner: userData.tipo_partner,
              nivel_hierarquico: userData.nivel_hierarquico
            }),
          });

          if (clientData) {
            const mappedClients: Client[] = Object.values(clientData).map((c: any) => {
              const plVal = c.pl_inicial ? (typeof c.pl_inicial === 'object' ? c.pl_inicial.parsedValue : c.pl_inicial) : 0;
              return {
                id: c.id_cliente.toString(),
                name: c.nome,
                avatarUrl: `https://images.unsplash.com/photo-${AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)]}?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
                aum: plVal >= 1000000 
                  ? `R$ ${(plVal / 1000000).toFixed(1)}M` 
                  : (plVal >= 1000 ? `R$ ${(plVal / 1000).toFixed(1)}k` : `R$ ${plVal.toFixed(2)}`),
                carteira: c.carteira,
                conta: c.conta,
                mainTrigger: {
                  type: c.carteira || 'Atendimento',
                  priority: Priority.LOW,
                  description: `Cliente cadastrado em ${new Date(c.data_registro).toLocaleDateString()}`,
                  date: c.data_registro
                }
              };
            });
            setClients(mappedClients);
          }
        } catch (error) {
          console.error("Failed to fetch clients:", error);
          // Fallback to generated clients if API fails
          setClients(generateClients());
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchDashboardData();
      fetchClients();
    }
  }, [isLoggedIn, userData]);

  // -- Fetch Detailed Client Data --
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client && !client.fullData) {
        const fetchDetailedClient = async () => {
          try {
            const response = await apiRequest(`/cliente-completo/${selectedClientId}?incluir_documentos=false&incluir_suitability=true&incluir_vinculacoes=true`);
            if (response.success && response.cliente) {
              setClients(prev => prev.map(c => 
                c.id === selectedClientId ? { ...c, fullData: response.cliente } : c
              ));
            }
          } catch (error) {
            console.error("Failed to fetch detailed client data:", error);
          }
        };
        fetchDetailedClient();
      }
    }
  }, [selectedClientId, clients]);

  // -- Computed Playlist Logic --
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.carteira?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const derivedPlaylist = useMemo(() => {
    let filtered = filteredClients;
    
    if (viewContext === 'PENSION') {
      filtered = [...filteredClients].sort((a, b) => {
        if (a.mainTrigger.type === TriggerType.PENSION && b.mainTrigger.type !== TriggerType.PENSION) return -1;
        if (a.mainTrigger.type !== TriggerType.PENSION && b.mainTrigger.type === TriggerType.PENSION) return 1;
        return 0;
      });
    } else if (viewContext === 'CHURN') {
        filtered = [...filteredClients].sort((a, b) => {
            if (a.mainTrigger.type === TriggerType.CHURN && b.mainTrigger.type !== TriggerType.CHURN) return -1;
            if (a.mainTrigger.type !== TriggerType.CHURN && b.mainTrigger.type === TriggerType.CHURN) return 1;
            return 0;
        });
    } else if (viewContext === 'PORTFOLIO') {
        const portfolioTypes = [TriggerType.REBALANCE, TriggerType.FIXED_INCOME, TriggerType.VARIABLE_INCOME];
        filtered = [...filteredClients].sort((a, b) => {
            const aIsPort = portfolioTypes.includes(a.mainTrigger.type);
            const bIsPort = portfolioTypes.includes(b.mainTrigger.type);
            if (aIsPort && !bIsPort) return -1;
            if (!aIsPort && bIsPort) return 1;
            return 0;
        });
    } else {
        // ALL: Sort by Priority High -> Low
        filtered = [...filteredClients].sort((a, b) => {
             const prioOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
             return prioOrder[a.mainTrigger.priority] - prioOrder[b.mainTrigger.priority];
        });
    }

    return filtered.map(c => c.id);
  }, [filteredClients, viewContext]);

  // -- Handlers --

  const handleNextClient = () => {
    if (!selectedClientId) return;
    const currentIndex = derivedPlaylist.indexOf(selectedClientId);
    if (currentIndex < derivedPlaylist.length - 1) {
      setSelectedClientId(derivedPlaylist[currentIndex + 1]);
      setSelectedSection('Resumo'); // Reset to summary when navigating
    }
  };

  const handlePrevClient = () => {
    if (!selectedClientId) return;
    const currentIndex = derivedPlaylist.indexOf(selectedClientId);
    if (currentIndex > 0) {
      setSelectedClientId(derivedPlaylist[currentIndex - 1]);
      setSelectedSection('Resumo'); // Reset to summary when navigating
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-black">
      
      {/* 1. The Journal Canvas (Background) */}
      <HomeJournal 
        clients={filteredClients}
        allClients={clients}
        metrics={metrics}
        viewContext={viewContext}
        isBlurred={!!selectedClientId}
        isLoading={isLoadingData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectClient={(id, section) => {
            setSelectedClientId(id);
            setSelectedSection(section || 'Resumo');
        }}
        onLogout={handleLogout}
      />

      {/* 2. The Dock (Fixed Navigation) 
      <DockMenu 
        activeContext={viewContext} 
        onSelectContext={(ctx) => {
            setViewContext(ctx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />*/}

      {/* 3. The Overlay (Modal) */}
      {selectedClientId && selectedClient && (
        <ClientOverlay 
          client={selectedClient}
          initialSection={selectedSection}
          onClose={() => setSelectedClientId(null)}
          onNext={handleNextClient}
          onPrev={handlePrevClient}
          hasNext={derivedPlaylist.indexOf(selectedClientId) < derivedPlaylist.length - 1}
          hasPrev={derivedPlaylist.indexOf(selectedClientId) > 0}
        />
      )}

    </div>
  );
}
