import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Mic,
  Send,
  Paperclip,
  FileText,
  CheckCircle2,
  Play,
  Pause,
  Wand2,
  Search as SearchIcon,
  QrCode,
  Smartphone,
  Zap,
  Sliders,
  Lock,
  Unlock,
  Target,
  ArrowRightLeft,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Check,
  RefreshCw,
  Brain,
  Smile,
  User,
  Building2,
  Wallet,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Activity,
  Info,
  X,
} from "lucide-react";
import {
  Client,
  TriggerType,
  ChatMessage,
  TimelineEvent,
  Priority,
  AutopilotConfig,
  FinancialGoal,
  AllocationOrder,
  PortfolioData,
  PortfolioAccount,
  ConsolidatedPosition,
} from "../types";
import * as GeminiService from "../services/geminiService";
import * as AnovaService from "../services/anovaService";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ClientBookProps {
  client: Client;
  initialSection?: string;
  userEmail?: string;
  onBack: () => void;
}

// --- Autopilot Mock Data Helper ---
const getMockAutopilot = (): AutopilotConfig => ({
  trustScore: 72,
  rationale: [
    "Alta consistência nas interações de e-mail (95% de aceitação).",
    "Falta de dados de voz recentes para calibração fina de tom.",
    "Cliente respondeu positivamente à última sugestão de rebalanceamento.",
  ],
  permissions: {
    autoSchedule: true,
    sendMarketUpdates: true,
    birthdayGreetings: true,
    portfolioRebalancing: false,
  },
  settings: {
    tone: "formal",
    periodicity: "weekly",
  },
});

const getMockGoals = (): FinancialGoal[] => [
  {
    id: "1",
    title: "Independência Financeira",
    category: "Aposentadoria",
    currentAmount: 2400000,
    targetAmount: 5000000,
    deadline: "2035",
    status: "on_track",
  },
  {
    id: "2",
    title: "Imóvel no Exterior",
    category: "Patrimônio",
    currentAmount: 350000,
    targetAmount: 1200000,
    deadline: "2028",
    status: "at_risk",
  },
  {
    id: "3",
    title: "Faculdade dos Filhos",
    category: "Educação",
    currentAmount: 180000,
    targetAmount: 400000,
    deadline: "2030",
    status: "on_track",
  },
];

const getMockOrders = (): AllocationOrder[] => [
  {
    id: "101",
    asset: "Tesouro IPCA+ 2035",
    ticker: "NTNB35",
    type: "buy",
    amount: 50000,
    status: "executed",
    date: "2023-10-25",
  },
  {
    id: "102",
    asset: "Veneza FI Multimercado",
    ticker: "VENEZA",
    type: "sell",
    amount: 25000,
    status: "pending",
    date: "2023-10-28",
  },
];

export const ClientBook: React.FC<ClientBookProps> = ({
  client,
  initialSection,
  userEmail,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState(initialSection || "Resumo");
  const [activeMobileView, setActiveMobileView] = useState<
    "profile" | "content" | "copilot"
  >("content");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false); // Closed by default on desktop
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      text: `Olá! Estou analisando a carteira de ${client.name}. O gatilho de ${client.mainTrigger.type} é prioritário hoje. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Portfolio State
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null,
  );
  const [selectedAccount, setSelectedAccount] =
    useState<PortfolioAccount | null>(null);
  const [consolidatedPosition, setConsolidatedPosition] =
    useState<ConsolidatedPosition | null>(null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isPositionLoading, setIsPositionLoading] = useState(false);

  // Allocation State
  const [orderStats, setOrderStats] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isAllocationLoading, setIsAllocationLoading] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Create Order State
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [clientBoletaDetails, setClientBoletaDetails] = useState<any>(null);
  const [fixedIncomeOptions, setFixedIncomeOptions] = useState<
    Record<string, any[]>
  >({});
  const [selectedOrderAccount, setSelectedOrderAccount] = useState<any>(null);
  const [activeFixedIncomeTab, setActiveFixedIncomeTab] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [orderProduto, setOrderProduto] = useState("renda_fixa");
  const [orderTipo, setOrderTipo] = useState("Aplicação");
  const [isLoadingCreateOrderData, setIsLoadingCreateOrderData] =
    useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Status change modal
  const [statusModalOrder, setStatusModalOrder] = useState<any>(null);
  const [statusModalDetails, setStatusModalDetails] = useState<any>(null);
  const [statusModalNovoStatus, setStatusModalNovoStatus] = useState("");
  const [statusModalJustificativa, setStatusModalJustificativa] = useState("");
  const [statusModalComprovante, setStatusModalComprovante] =
    useState<File | null>(null);
  const [isStatusModalLoading, setIsStatusModalLoading] = useState(false);
  const [isStatusModalSubmitting, setIsStatusModalSubmitting] = useState(false);
  const [statusModalJustificativaError, setStatusModalJustificativaError] =
    useState(false);

  // Autopilot State
  const [autopilot, setAutopilot] = useState<AutopilotConfig>(
    client.autopilot || getMockAutopilot(),
  );
  const [showAutopilotModal, setShowAutopilotModal] = useState(false);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<{ disconnect: () => Promise<void> } | null>(
    null,
  );

  // Additional Data
  const goals = client.goals || getMockGoals();
  const orders = client.orders || getMockOrders();

  // Timeline Mock Data
  const timeline: TimelineEvent[] = [
    {
      id: "1",
      date: "Hoje",
      title: "Alerta de Previdência",
      description: "Contribuição anual abaixo do teto fiscal.",
      category: "system",
    },
    {
      id: "2",
      date: "15 Out",
      title: "Reunião Semestral",
      description: "Revisão de alocação e objetivos.",
      category: "meeting",
    },
    {
      id: "3",
      date: "02 Out",
      title: "Aporte Recebido",
      description: "R$ 50.000,00 em CDB Liquidez Diária.",
      category: "transaction",
    },
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: chatInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsThinking(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));
      const needsThinking =
        chatInput.toLowerCase().includes("analise") ||
        chatInput.toLowerCase().includes("estratégia");
      const response = await GeminiService.sendMessage(
        history,
        userMsg.text,
        needsThinking,
      );
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text,
        timestamp: new Date(),
      };
      if (response.webSources && response.webSources.length > 0) {
        botMsg.text += `\n\nFontes:\n${response.webSources.map((url) => `- ${url}`).join("\n")}`;
      }
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Erro ao processar.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleLive = async () => {
    if (isLiveActive) {
      if (liveSessionRef.current) {
        await liveSessionRef.current.disconnect();
        liveSessionRef.current = null;
      }
      setIsLiveActive(false);
    } else {
      setIsLiveActive(true);
      const session = await GeminiService.connectLiveSession(
        (audioBuffer) => playAudioBuffer(audioBuffer),
        () => setIsLiveActive(false),
      );
      if (session) liveSessionRef.current = session;
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const handleTTS = async (text: string) => {
    setIsPlaying(true);
    const buffer = await GeminiService.speakText(text);
    if (buffer) playAudioBuffer(buffer);
    setIsPlaying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for file logic
  };

  // --- Portfolio Logic ---
  useEffect(() => {
    if (activeTab === "Carteira" && !portfolioData) {
      loadPortfolioData();
    }
  }, [activeTab, client.name]);

  // --- Allocation Logic ---
  const normalizeText = (value: string = "") =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getStatusKey = (status: string = "") => {
    const normalized = normalizeText(status).replace(/\s+/g, "_");

    if (normalized.includes("execut")) return "executado";
    if (normalized.includes("rejeit")) return "rejeitado";
    if (normalized.includes("abert")) return "aberto";
    if (normalized.includes("pendenc")) return "com_pendencia";
    if (normalized.includes("trat")) return "em_tratamento";
    if (normalized.includes("fech")) return "fechado";
    return normalized || "outro";
  };

  useEffect(() => {
    const clientId = Number(client.id);
    if (activeTab === "Alocação" && Number.isFinite(clientId) && clientId > 0) {
      loadAllocationData(clientId);
    }
  }, [activeTab, client.id]);

  const loadAllocationData = async (clientId: number) => {
    setIsAllocationLoading(true);
    try {
      const list = await AnovaService.getOrdersByClient(clientId);
      const parsedList = Array.isArray(list) ? list : [];
      setOrdersList(parsedList);

      const stats = parsedList.reduce(
        (acc, order) => {
          const key = getStatusKey(order?.status);
          if (key === "fechado") acc.fechados += 1;
          if (key === "aberto") acc.abertos += 1;
          if (key === "com_pendencia") acc.com_pendencia += 1;
          if (key === "em_tratamento") acc.em_tratamento += 1;
          if (key === "executado") acc.executados += 1;
          if (key === "rejeitado") acc.rejeitados += 1;
          return acc;
        },
        {
          fechados: 0,
          abertos: 0,
          com_pendencia: 0,
          em_tratamento: 0,
          executados: 0,
          rejeitados: 0,
        },
      );
      setOrderStats(stats);
    } catch (error) {
      console.error("Error loading allocation data:", error);
    } finally {
      setIsAllocationLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = normalizeText(orderSearchQuery);
    return ordersList.filter((order) => {
      const matchesQuery =
        !query ||
        normalizeText(order?.assunto || "").includes(query) ||
        normalizeText(order?.ordem_tipo || "").includes(query);

      const matchesStatus =
        orderStatusFilter === "all" ||
        getStatusKey(order?.status) === orderStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [ordersList, orderSearchQuery, orderStatusFilter]);

  // --- Create Order Logic ---
  useEffect(() => {
    if (showCreateOrder) {
      loadCreateOrderData();
    }
  }, [showCreateOrder]);

  const loadCreateOrderData = async () => {
    setIsLoadingCreateOrderData(true);
    setClientBoletaDetails(null);
    setFixedIncomeOptions({});
    setSelectedOrderAccount(null);
    setActiveFixedIncomeTab("");
    setOrderDescription("");
    const clientName =
      client.fullData?.nome_completo || client.name;
    try {
      const [details, fixedIncome] = await Promise.all([
        AnovaService.getClientBoletaDetails(clientName),
        AnovaService.getFixedIncomeOptions(),
      ]);

      if (details) {
        setClientBoletaDetails(details);
        const allAccounts = [
          ...(details.btg || []).map((a: any) => ({
            ...a,
            _corretora: "BTG",
          })),
          ...(details.xp || []).map((a: any) => ({ ...a, _corretora: "XP" })),
          ...(details.outras || []).map((a: any) => ({
            ...a,
            _corretora: "Outras",
          })),
        ];
        if (allAccounts.length > 0) setSelectedOrderAccount(allAccounts[0]);
      }

      if (fixedIncome && typeof fixedIncome === "object") {
        setFixedIncomeOptions(fixedIncome);
        const firstKey = Object.keys(fixedIncome)[0] || "";
        setActiveFixedIncomeTab(firstKey);
      }
    } catch {
      toast.error("Erro ao carregar dados para criação de ordem");
    } finally {
      setIsLoadingCreateOrderData(false);
    }
  };

  const handleCloseCreateOrder = () => {
    setShowCreateOrder(false);
    setOrderDescription("");
    setOrderProduto("renda_fixa");
    setOrderTipo("Aplicação");
    setSelectedOrderAccount(null);
    setClientBoletaDetails(null);
    setFixedIncomeOptions({});
  };

  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const h = now.getHours();
    const m = now.getMinutes();
    // Mercado aberto de segunda a sexta, das 09h às 16h
    return day >= 1 && day <= 5 && h * 60 + m >= 9 * 60 && h * 60 + m < 16 * 60;
  };

  const formatTimeNow = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const applyAssetToDescription = (item: any) => {
    const formatDate = (d: string) => {
      if (!d) return "-";
      if (d.includes("-")) {
        const [y, mo, day] = d.split("-");
        return `${day}/${mo}/${y}`;
      }
      return d;
    };
    const lines = [
      `Emissor: ${item.emissor || "-"}`,
      `Produto: ${item.tipo_ativo || "-"}`,
      item.prazo != null ? `Prazo: ${item.prazo} dias` : null,
      item.vencimento ? `Vencimento: ${formatDate(item.vencimento)}` : null,
      item.indexador ? `Indexador: ${item.indexador}` : null,
      item.taxa ? `Taxa: ${item.taxa}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setOrderDescription((prev) => (prev.trim() ? `${prev}\n\n${lines}` : lines));
  };

  const handleSubmitOrder = async () => {
    if (!selectedOrderAccount) {
      toast.error("Selecione uma conta para continuar");
      return;
    }
    if (!orderDescription.trim()) {
      toast.error("Adicione uma descrição para a ordem");
      return;
    }
    if (!userEmail) {
      toast.error("E-mail do assessor não encontrado");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const saldoRaw = selectedOrderAccount?.saldo;
      const saldo =
        typeof saldoRaw === "object"
          ? saldoRaw?.parsedValue ?? null
          : typeof saldoRaw === "number"
            ? saldoRaw
            : null;

      await AnovaService.createOrder(userEmail, {
        conta_cliente: selectedOrderAccount.conta,
        produto: orderProduto,
        ordem_tipo: orderTipo || null,
        primeira_mensagem: orderDescription,
        saldo_abertura: saldo,
      });
      toast.success("Ordem criada com sucesso!");
      handleCloseCreateOrder();
      const clientId = Number(client.id);
      if (Number.isFinite(clientId) && clientId > 0) {
        loadAllocationData(clientId);
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao criar a ordem");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const STATUS_OPCOES = [
    { value: "aberto", label: "Ordem Aberta" },
    { value: "com_pendencia", label: "Ordem com pendência" },
    { value: "em_tratamento", label: "Ordem em tratamento" },
    { value: "executado", label: "Ordem executada" },
    { value: "rejeitado", label: "Ordem rejeitada" },
  ] as const;

  const handleOpenStatusModal = async (order: any) => {
    if (!userEmail) {
      toast.error("E-mail do assessor não encontrado");
      return;
    }
    setStatusModalOrder(order);
    setStatusModalDetails(null);
    setStatusModalNovoStatus("");
    setStatusModalJustificativa("");
    setStatusModalComprovante(null);
    setStatusModalJustificativaError(false);
    setIsStatusModalLoading(true);
    try {
      const details = await AnovaService.getOrderById(order.ticket_id, userEmail);
      if (details) {
        setStatusModalDetails(details);
        const currentKey = getStatusKey(details.status);
        setStatusModalNovoStatus(currentKey || "aberto");
      } else {
        toast.error("Não foi possível carregar os detalhes da ordem");
        setStatusModalOrder(null);
      }
    } catch {
      toast.error("Erro ao carregar ordem");
      setStatusModalOrder(null);
    } finally {
      setIsStatusModalLoading(false);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModalOrder(null);
    setStatusModalDetails(null);
    setStatusModalNovoStatus("");
    setStatusModalJustificativa("");
    setStatusModalComprovante(null);
    setStatusModalJustificativaError(false);
  };

  const handleConfirmStatusChange = async () => {
    const trimmed = statusModalJustificativa.trim();
    if (!trimmed) {
      setStatusModalJustificativaError(true);
      return;
    }
    if (!userEmail || !statusModalOrder) return;

    setIsStatusModalSubmitting(true);
    setStatusModalJustificativaError(false);
    try {
      await AnovaService.updateOrderStatus(
        statusModalOrder.ticket_id,
        userEmail,
        {
          novo_status: statusModalNovoStatus,
          justificativa: trimmed,
          comprovante_execucao: statusModalComprovante || undefined,
          tipo: "texto",
        },
      );
      toast.success("Status atualizado com sucesso!");
      handleCloseStatusModal();
      const clientId = Number(client.id);
      if (Number.isFinite(clientId) && clientId > 0) {
        loadAllocationData(clientId);
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar status");
    } finally {
      setIsStatusModalSubmitting(false);
    }
  };

  const loadPortfolioData = async () => {
    setIsPortfolioLoading(true);
    const name = client.fullData?.nome_completo || client.name;
    const data = await AnovaService.getPortfolioAccounts(name);
    if (data) {
      setPortfolioData(data);
      // Auto-select first account if available
      const allAccounts = [
        ...(data.btg || []),
        ...(data.xp || []),
        ...(data.outras || []),
      ];
      if (allAccounts.length > 0) {
        handleAccountSelect(allAccounts[0]);
      }
    }
    setIsPortfolioLoading(false);
  };

  const handleAccountSelect = async (account: PortfolioAccount) => {
    setSelectedAccount(account);
    setIsPositionLoading(true);
    const position = await AnovaService.getConsolidatedPosition(account.conta);
    if (position) {
      setConsolidatedPosition(position);
    }
    setIsPositionLoading(false);
  };

  const renderPortfolio = () => {
    if (isPortfolioLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">
            Carregando contas da carteira...
          </p>
        </div>
      );
    }

    if (!portfolioData) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            Nenhuma carteira encontrada
          </h3>
          <p className="text-slate-500">
            Não foi possível localizar dados de carteira para este cliente.
          </p>
          <button
            onClick={loadPortfolioData}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    const allAccounts = [
      ...(portfolioData.btg || []).map((a) => ({ ...a, broker: "BTG" })),
      ...(portfolioData.xp || []).map((a) => ({ ...a, broker: "XP" })),
      ...(portfolioData.outras || []).map((a) => ({ ...a, broker: "Outras" })),
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Account Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
          {allAccounts.map((acc, idx) => (
            <button
              key={`${acc.conta}-${idx}`}
              onClick={() => handleAccountSelect(acc)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border shadow-sm ${
                selectedAccount?.conta === acc.conta
                  ? "bg-slate-900 text-white border-slate-900 shadow-indigo-900/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {acc.carteira} ({acc.broker})
            </button>
          ))}
        </div>

        {selectedAccount && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {selectedAccount.nome_completo}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedAccount.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 lg:gap-10 flex-1 w-full">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Conta
                  </p>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {selectedAccount.conta}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Perfil
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAccount.perfil_investidor}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Tipo
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase border border-emerald-100">
                    {selectedAccount.classificacao_investidor}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Broker
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAccount.corretora}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Início
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAccount.data_registro}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isPositionLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">
              Consolidando posição patrimonial...
            </p>
          </div>
        ) : consolidatedPosition ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Cards Section */}
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
              {/* Total Equity Card */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 col-span-full group hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Patrimônio total
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Valor total investido e consolidado
                    </p>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                      R${" "}
                      {parseFloat(
                        consolidatedPosition.TotalAmmount,
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Wallet className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              {consolidatedPosition.SummaryAccounts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.MarketName}
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">
                    R${" "}
                    {parseFloat(item.EndPositionValue).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">
                    Saldo atual em conta
                  </p>
                </div>
              ))}

              {/* Placeholder cards for other categories */}
              {[
                "Renda Variável",
                "Renda Fixa",
                "Fundos",
                "Previdência",
                "Futuros",
                "Derivativos Opções",
                "Valor em Trânsito",
                "COE",
                "Provisão Evento RF",
                "Margem em Dinheiro",
              ].map((cat) => {
                const exists = consolidatedPosition.SummaryAccounts.find(
                  (s) => s.MarketName === cat,
                );
                if (exists) return null;
                return (
                  <div
                    key={cat}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 opacity-60 hover:opacity-100 transition-all"
                  >
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {cat}
                    </h4>
                    <p className="text-2xl font-bold text-slate-300 tracking-tight">
                      R$ 0,00
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium">
                      Sem alocação ativa
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Chart Section */}
            <div className="xl:col-span-4 flex flex-col">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2 text-lg">
                  <PieChartIcon className="w-6 h-6 text-indigo-600" /> Alocação
                  Patrimonial
                </h3>
                <div className="flex-1 min-h-[350px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          consolidatedPosition.Distribution,
                        ).map(([name, value]) => ({
                          name,
                          value: parseFloat(value as string),
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {Object.entries(consolidatedPosition.Distribution).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#4F46E5",
                                  "#10B981",
                                  "#F59E0B",
                                  "#EF4444",
                                  "#6366F1",
                                  "#8B5CF6",
                                ][index % 6]
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(2)}%`}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          padding: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                      Total
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      100%
                    </span>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {Object.entries(consolidatedPosition.Distribution).map(
                    ([name, value], idx) => (
                      <div
                        key={name}
                        className="flex justify-between items-center text-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{
                              backgroundColor: [
                                "#4F46E5",
                                "#10B981",
                                "#F59E0B",
                                "#EF4444",
                                "#6366F1",
                                "#8B5CF6",
                              ][idx % 6],
                            }}
                          />
                          <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                            {name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">
                          {value}%
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center py-32">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Activity className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Selecione uma conta para análise
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Escolha uma das contas acima para visualizar o detalhamento da
              posição consolidada.
            </p>
          </div>
        )}
      </div>
    );
  };

  // --- Render Sections ---

  const renderAutopilotModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setShowAutopilotModal(false)}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-[0.98]">
        <div className="bg-slate-900 px-6 py-6 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl font-bold">Autopilot Command Center</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Configuração de autonomia da IA
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-serif">
              {autopilot.trustScore}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              Trust Score
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Rationale */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Racional do Score
            </h3>
            <ul className="space-y-2">
              {autopilot.rationale.map((r, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Permissions Toggles */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Permissões de Autonomia
            </h3>
            <div className="space-y-3">
              {Object.entries(autopilot.permissions).map(([key, enabled]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                >
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <button
                    onClick={() =>
                      setAutopilot((prev) => ({
                        ...prev,
                        permissions: { ...prev.permissions, [key]: !enabled },
                      }))
                    }
                    className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? "bg-green-500" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fine Tuning */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Calibração Fina
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-xl">
                <label className="text-xs text-slate-500 font-bold block mb-2">
                  Tom de Voz
                </label>
                <select
                  value={autopilot.settings.tone}
                  onChange={(e) =>
                    setAutopilot((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        tone: e.target.value as any,
                      },
                    }))
                  }
                  className="w-full text-sm bg-slate-50 border-none rounded-lg focus:ring-0"
                >
                  <option value="formal">Formal</option>
                  <option value="neutral">Neutro</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <label className="text-xs text-slate-500 font-bold block mb-2">
                  Periodicidade
                </label>
                <select
                  value={autopilot.settings.periodicity}
                  onChange={(e) =>
                    setAutopilot((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        periodicity: e.target.value as any,
                      },
                    }))
                  }
                  className="w-full text-sm bg-slate-50 border-none rounded-lg focus:ring-0"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setShowAutopilotModal(false)}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800"
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );

  const renderMessaging = () => (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">WhatsApp Business</h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50">
        {/* Mock History */}
        <div className="flex justify-center">
          <span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
            Hoje
          </span>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
            <p className="text-slate-700 text-sm">
              Bom dia! Poderia me enviar a lâmina daquele fundo multimercado que
              comentamos?
            </p>
            <span className="text-[10px] text-slate-400 mt-2 block">10:42</span>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[70%] bg-emerald-600 text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
            <p className="text-sm">
              Olá {client.name.split(" ")[0]}, tudo bem? Claro! Segue abaixo a
              lâmina do Fundo Veneza. Recomendo também agendarmos uma call para
              discutir a estratégia.
            </p>
            <div className="mt-3 bg-white/10 rounded-lg p-3 flex items-center gap-3">
              <FileText className="w-8 h-8 text-white/80" />
              <div>
                <p className="text-xs font-bold">
                  Veneza_Multimercado_Out23.pdf
                </p>
                <p className="text-[10px] opacity-70">2.4 MB • PDF</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-100 mt-2 block text-right">
              10:45 • Enviado
            </span>
          </div>
        </div>

        {/* Audio Message Mock */}
        <div className="flex justify-start">
          <div className="flex items-center gap-2">
            <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3 min-w-[200px]">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
              <div className="flex-1">
                <div className="h-1 bg-slate-200 rounded-full w-full relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-slate-400 rounded-full" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  0:24
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 placeholder-slate-400"
            />
            <button className="text-slate-400 hover:text-slate-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors group relative">
            <Mic className="w-5 h-5" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Gravar Áudio
            </span>
          </button>

          <button className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-md transition-all hover:scale-105">
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs text-slate-500 font-bold uppercase">
            Patrimônio Atual
          </h4>
          <p className="text-2xl font-serif font-bold text-slate-900 mt-1">
            {client.fullData?.patrimonio_liquido
              ? `R$ ${client.fullData.patrimonio_liquido.toLocaleString()}`
              : client.aum}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs text-slate-500 font-bold uppercase">
            Meta Principal
          </h4>
          <p className="text-2xl font-serif font-bold text-indigo-600 mt-1">
            R$ 5.0M
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Independência Financeira
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs text-slate-500 font-bold uppercase">
            Progresso Global
          </h4>
          <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
            48%
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[48%]" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" /> Objetivos de Vida
            (CFP)
          </h3>
          <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            + Novo Objetivo
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {goals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100),
            );
            return (
              <div
                key={goal.id}
                className="p-6 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {goal.title}
                      </h4>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {goal.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Prazo: {goal.deadline}
                    </p>
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      goal.status === "on_track"
                        ? "bg-emerald-100 text-emerald-700"
                        : goal.status === "at_risk"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {goal.status.replace("_", " ")}
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-slate-600">
                      R$ {goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-slate-900">
                      R$ {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        goal.status === "at_risk"
                          ? "bg-amber-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCreateOrder = () => {
    const allAccounts = clientBoletaDetails
      ? [
          ...(clientBoletaDetails.btg || []).map((a: any) => ({
            ...a,
            _corretora: "BTG",
          })),
          ...(clientBoletaDetails.xp || []).map((a: any) => ({
            ...a,
            _corretora: "XP",
          })),
          ...(clientBoletaDetails.outras || []).map((a: any) => ({
            ...a,
            _corretora: "Outras",
          })),
        ]
      : [];

    const fixedIncomeTabs = Object.keys(fixedIncomeOptions);
    const activeItems: any[] = fixedIncomeOptions[activeFixedIncomeTab] || [];

    const saldoRaw = selectedOrderAccount?.saldo;
    const saldoValue =
      typeof saldoRaw === "object"
        ? saldoRaw?.parsedValue ?? null
        : typeof saldoRaw === "number"
          ? saldoRaw
          : null;

    const marketOpen = isMarketOpen();

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseCreateOrder}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 font-serif">
            Abrir Ordem
          </h2>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Atenção:</strong> As ofertas de ativos do mercado de renda
            fixa são atualizadas diariamente{" "}
            <strong>a partir das 11h da manhã.</strong>
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Loading overlay */}
          {isLoadingCreateOrderData && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">Carregando dados...</p>
            </div>
          )}

          {!isLoadingCreateOrderData && (
            <div className="p-6 space-y-6">
              {/* Client & account tabs */}
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                    {clientBoletaDetails?.nome_completo ||
                      client.fullData?.nome_completo ||
                      client.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedOrderAccount?.email || ""}
                  </p>
                </div>
              </div>

              {/* Account selector tabs */}
              {allAccounts.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {allAccounts.map((acc, i) => (
                    <button
                      key={`${acc.conta}-${i}`}
                      onClick={() => setSelectedOrderAccount(acc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedOrderAccount?.conta === acc.conta
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {acc.carteira}
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          selectedOrderAccount?.conta === acc.conta
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {acc._corretora}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Account info row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Número da Conta
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium min-h-[42px]">
                    {selectedOrderAccount?.conta || "—"}
                    {selectedOrderAccount?.conta && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Suitability
                  </label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium min-h-[42px]">
                    {selectedOrderAccount?.perfil_investidor || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Saldo em Conta
                  </label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium min-h-[42px]">
                    {saldoValue != null
                      ? `R$ ${saldoValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Assunto & Tipo de Ordem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Assunto
                  </label>
                  <select
                    value={orderProduto}
                    onChange={(e) => setOrderProduto(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="renda_fixa">Renda Fixa</option>
                    <option value="renda_variavel">Renda Variável</option>
                    <option value="fundos">Fundos</option>
                    <option value="transferencia">Transferência</option>
                    <option value="zerar_posicoes">Zerar posições</option>
                    <option value="duvidas">Dúvidas</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Tipo de Ordem
                  </label>
                  <select
                    value={orderTipo}
                    onChange={(e) => setOrderTipo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Aplicação">Aplicação</option>
                    <option value="Resgate">Resgate</option>
                  </select>
                </div>
              </div>

              {/* Description textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Descrição da Solicitação da Ordem
                </label>
                <textarea
                  rows={7}
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  placeholder="Digite a descrição da solicitação da ordem..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors resize-y placeholder-slate-400"
                />
              </div>

              {/* Footer: Annexo + Market + Submit */}
              <div className="flex flex-col gap-4 pt-2">
                {/* Linha 1: Anexar documento */}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-indigo-600 transition-colors group w-fit">
                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  Anexar Documento (Opcional)
                  <input type="file" className="hidden" />
                </label>

                {/* Linha 2: Indicador de mercado + botão */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Badge de mercado */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        marketOpen
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          marketOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-400"
                        }`}
                      />
                      {marketOpen ? "Mercado aberto" : "Mercado fechado"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatTimeNow()} · 09h–16h
                    </span>
                  </div>

                  {/* Botão com tooltip quando mercado fechado */}
                  <div className="relative group/submit">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={
                        isSubmittingOrder ||
                        !marketOpen ||
                        !selectedOrderAccount ||
                        !orderDescription.trim()
                      }
                      className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        !marketOpen
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isSubmittingOrder && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Enviar Nova Ordem
                    </button>
                    {!marketOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-52 bg-slate-800 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover/submit:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed">
                        O mercado está fechado. Ordens só podem ser criadas entre 09h e 16h, de segunda a sexta.
                        <span className="absolute bottom-[-4px] right-6 w-2 h-2 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Income Table */}
        {!isLoadingCreateOrderData && fixedIncomeTabs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">
                Títulos de Renda Fixa
              </h4>
              {selectedOrderAccount?._corretora && (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Corretora: {selectedOrderAccount._corretora}
                </span>
              )}
            </div>

            {/* Type tabs — scroll lateral no mobile */}
            <div className="overflow-x-auto border-b border-slate-100 no-scrollbar">
              <div className="flex gap-1 px-4 pt-4 pb-0 min-w-max">
                {fixedIncomeTabs.map((tab) => {
                  const count = fixedIncomeOptions[tab]?.length ?? 0;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFixedIncomeTab(tab)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
                        activeFixedIncomeTab === tab
                          ? "border-slate-900 text-slate-900 bg-slate-50"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tab}
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          activeFixedIncomeTab === tab
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
              {activeItems.length > 0 ? (
                <table className="w-full min-w-[1100px] text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-12">Aplicar</th>
                      <th className="px-4 py-3">Emissor</th>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Prazo (dias)</th>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Indexador</th>
                      <th className="px-4 py-3">Taxa (%)</th>
                      <th className="px-4 py-3">Aplic. Mínima</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Juros</th>
                      <th className="px-4 py-3">Carência (dias)</th>
                      <th className="px-4 py-3">Data Oferta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeItems.map((item, idx) => {
                      const formatDate = (d: string) => {
                        if (!d) return "-";
                        if (d.includes("-")) {
                          const [y, mo, day] = d.split("-");
                          return `${day}/${mo}/${y}`;
                        }
                        return d;
                      };
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="relative group/apply">
                              <button
                                onClick={() => applyAssetToDescription(item)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all font-bold text-lg leading-none"
                                title="Aplicar na descrição"
                              >
                                →
                              </button>
                              <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/apply:opacity-100 transition-opacity pointer-events-none z-20">
                                Aplicar Título na Descrição
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                            {item.emissor || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {item.tipo_ativo || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {item.prazo != null ? item.prazo : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap tabular-nums">
                            {item.vencimento
                              ? formatDate(item.vencimento)
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {item.indexador || "-"}
                          </td>
                          <td className="px-4 py-3 font-bold text-indigo-700 whitespace-nowrap">
                            {item.taxa || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.aplicacao_minima ? (
                              <span className="text-emerald-700 font-medium">
                                {typeof item.aplicacao_minima === "number"
                                  ? `R$ ${item.aplicacao_minima.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                  : item.aplicacao_minima}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {item.rating || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {item.juros || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {item.carencia != null ? item.carencia : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                            {item.data_oferta
                              ? formatDate(item.data_oferta)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center text-slate-400 font-medium">
                  Nenhum título disponível para esta categoria.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAllocation = () => {
    if (showCreateOrder) return renderCreateOrder();
    return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Order Entry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Central de
          Alocação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Buscar ordens
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Buscar por assunto ou tipo..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Status
            </label>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="aberto">Aberto</option>
              <option value="com_pendencia">Com Pendência</option>
              <option value="em_tratamento">Em tratamento</option>
              <option value="executado">Executado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => setShowCreateOrder(true)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Criar Ordem
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {orderStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Fechadas",
              value: orderStats.fechados,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Abertas",
              value: orderStats.abertos,
              color: "text-slate-600",
              bg: "bg-slate-50",
            },
            {
              label: "Com Pendência",
              value: orderStats.com_pendencia,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Em Tratamento",
              value: orderStats.em_tratamento,
              color: "text-cyan-600",
              bg: "bg-cyan-50",
            },
            {
              label: "Executadas",
              value: orderStats.executados,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Rejeitadas",
              value: orderStats.rejeitados,
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-")}`}
                  style={{ backgroundColor: stat.color.replace("text-", "") }}
                />
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h4 className="font-bold text-slate-700 text-sm">Tabela de Ordens</h4>
          {isAllocationLoading && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="max-h-[560px] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[1150px] text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Ações</th>
                <th className="px-6 py-4">ID Ordem</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Hub</th>
                <th className="px-6 py-4">Assunto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0
                ? filteredOrders.map((order, idx) => (
                    <tr
                      key={order.ticket_id || idx}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          title="Alterar status"
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        ID-{order.ticket_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {order.nome_cliente}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">
                            CT
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.nome_hub}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.assunto}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.ordem_tipo}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                            getStatusKey(order.status) === "executado"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : getStatusKey(order.status) === "aberto"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : getStatusKey(order.status) === "rejeitado"
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : getStatusKey(order.status) ===
                                      "com_pendencia"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-cyan-50 text-cyan-700 border border-cyan-100"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {order.aberto_em
                          ? new Date(order.aberto_em).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                : !isAllocationLoading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-20 text-center text-slate-400 font-medium"
                      >
                        Nenhuma ordem encontrada para o filtro aplicado.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const renderStatusModal = () => {
    if (!statusModalOrder) return null;
    const currentStatusKey = statusModalDetails
      ? getStatusKey(statusModalDetails.status)
      : "aberto";
    const currentLabel =
      STATUS_OPCOES.find((o) => o.value === currentStatusKey)?.label ||
      statusModalDetails?.status ||
      "—";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={handleCloseStatusModal}
        />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-[0.98]">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              ID-{statusModalOrder.ticket_id}
            </h2>
            <button
              onClick={handleCloseStatusModal}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {isStatusModalLoading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Carregando...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Status Atual
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="text-sm font-medium text-slate-800">
                        {currentLabel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Alterar Status
                    </label>
                    <select
                      value={statusModalNovoStatus}
                      onChange={(e) => setStatusModalNovoStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {STATUS_OPCOES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Justificativa da mudança de status *
                  </label>
                  <textarea
                    rows={4}
                    value={statusModalJustificativa}
                    onChange={(e) => {
                      setStatusModalJustificativa(e.target.value);
                      setStatusModalJustificativaError(false);
                    }}
                    placeholder="Digite a justificativa para a mudança de status..."
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm resize-y placeholder-slate-400 focus:outline-none ${
                      statusModalJustificativaError
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                  {statusModalJustificativaError && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      A justificativa é obrigatória
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-indigo-600 transition-colors group w-fit">
                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  Anexar Comprovante
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setStatusModalComprovante(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </>
            )}
          </div>

          {!isStatusModalLoading && (
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleConfirmStatusChange}
                disabled={
                  isStatusModalSubmitting || !statusModalJustificativa.trim()
                }
                className="px-6 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isStatusModalSubmitting && (
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                )}
                Confirmar Status
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 overflow-hidden relative">
      {showAutopilotModal && renderAutopilotModal()}
      {statusModalOrder && renderStatusModal()}

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white z-20">
        <button
          onClick={() => setActiveMobileView("profile")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === "profile" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"}`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveMobileView("content")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === "content" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"}`}
        >
          {activeTab}
        </button>
        <button
          onClick={() => setActiveMobileView("copilot")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === "copilot" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"}`}
        >
          Copilot
        </button>
      </div>

      {/* COLUMN 1: Profile & Navigation (Sticky Left) */}
      <aside
        className={`
        w-full md:w-72 lg:w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm
        ${activeMobileView === "profile" ? "flex" : "hidden md:flex"}
      `}
      >
        <div className="p-6 border-b border-slate-100 relative">
          {/* Autopilot Score Badge (Clickable) */}
          <div
            onClick={() => setShowAutopilotModal(true)}
            className="absolute top-4 right-4 bg-slate-900 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-600 transition-colors shadow-md z-20 group"
          >
            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 group-hover:animate-pulse" />
            {autopilot.trustScore}
          </div>

          <div className="text-center pt-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-slate-400">
                <User className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <span className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {client.fullData?.nome_completo || client.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                {client.fullData?.classificacao_investidor || client.profile}
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                {client.lifeStage}
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-around">
            <button
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title={client.fullData?.celular}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title={client.fullData?.email}
            >
              <Mail className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* {['Resumo', 'Linha do Tempo', 'Planejamento', 'Carteira', 'Alocação', 'Mensageria', 'Previdência', 'Renda Fixa', 'Caixa'].map((item) => ( */}
          {["Resumo", "Carteira", "Alocação"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                if (window.innerWidth < 768) setActiveMobileView("content");
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                activeTab === item
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                {item === "Mensageria" && <MessageSquare className="w-4 h-4" />}
                {item === "Planejamento" && <Target className="w-4 h-4" />}
                {item === "Alocação" && <ArrowRightLeft className="w-4 h-4" />}
                {item}
              </span>
              {item === "Previdência" &&
                client.mainTrigger.type === TriggerType.PENSION && (
                  <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>
                )}
            </button>
          ))}
        </nav>
      </aside>

      {/* COLUMN 2: Main Content (Scrollable Center) */}
      <main
        className={`
        flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 scroll-smooth pb-32
        ${activeMobileView === "content" ? "block" : "hidden md:block"}
      `}
      >
        <div
          className={`mx-auto space-y-6 ${activeTab === "Alocação" ? "w-full max-w-[1400px]" : "max-w-4xl"}`}
        >
          {/* Header of Section */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 font-serif">
              {activeTab}
            </h1>
            <div className="flex gap-2">
              <span className="text-xs md:text-sm text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Sincronizado:</span> 09:41
              </span>
            </div>
          </div>

          {/* Content Rendering Switch */}
          {activeTab === "Mensageria" && renderMessaging()}
          {activeTab === "Planejamento" && renderPlanning()}
          {activeTab === "Alocação" && renderAllocation()}
          {activeTab === "Carteira" && renderPortfolio()}

          {/* Dados Cadastrais Section */}
          {activeTab === "Resumo" && client.fullData && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Dados Cadastrais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    CPF
                  </p>
                  <p className="text-slate-900 font-medium">
                    {client.fullData.cpf}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Data de Nascimento
                  </p>
                  <p className="text-slate-900 font-medium">
                    {client.fullData.data_nascimento}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Estado Civil
                  </p>
                  <p className="text-slate-900 font-medium">
                    {client.fullData.estado_civil}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Classificação
                  </p>
                  <p className="text-slate-900 font-medium">
                    {client.fullData.classificacao_investidor}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Patrimônio Líquido
                  </p>
                  <p className="text-slate-900 font-medium">
                    R$ {client.fullData.patrimonio_liquido?.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Rendimento Mensal
                  </p>
                  <p className="text-slate-900 font-medium">
                    R$ {client.fullData.rendimento_mensal?.toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-1">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Endereço
                  </p>
                  <p className="text-slate-900 font-medium">
                    {client.fullData.endereco},{" "}
                    {client.fullData.numero_endereco}{" "}
                    {client.fullData.complemento_endereco &&
                      `- ${client.fullData.complemento_endereco}`}
                    <br />
                    {client.fullData.bairro_endereco} -{" "}
                    {client.fullData.cidade_endereco}/
                    {client.fullData.estado_endereco} - CEP:{" "}
                    {client.fullData.cep}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Contextual Content for 'Resumo' etc. */}
          {client.mainTrigger.type === TriggerType.PENSION &&
            (activeTab === "Resumo" || activeTab === "Previdência") && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900">
                      Atenção: Benefício Fiscal em Risco
                    </h3>
                    <p className="text-orange-800/80 mt-1 text-sm">
                      {client.name} ainda pode aportar{" "}
                      <strong className="font-semibold">R$ 12.500,00</strong> em
                      PGBL para maximizar a dedução de IR deste ano.
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Diagnóstico da IA
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                      <p>
                        Baseado na renda declarada de R$ 350k/ano, o teto de 12%
                        para PGBL é R$ 42k. O cliente aportou apenas R$ 29.5k
                        até agora. Aportar a diferença gera uma restituição
                        estimada de R$ 3.437,50 (alíquota 27.5%).
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        Sugestão de Mensagem
                      </h4>
                      <button
                        onClick={() =>
                          handleTTS(
                            `Olá ${client.name}. Analisei seu planejamento tributário e notei uma oportunidade importante. Você ainda tem espaço para aportar doze mil e quinhentos reais em P G B L e garantir o benefício fiscal máximo. Posso enviar uma simulação?`,
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"
                      >
                        {isPlaying ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}{" "}
                        Ouvir
                      </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 relative group">
                      <p className="text-slate-600 italic">
                        "Olá, {client.name.split(" ")[0]}! Tudo bem? Estava
                        revisando seu planejamento tributário e notei uma
                        oportunidade. Você ainda tem espaço para aportar R$
                        12.5k em PGBL e garantir o benefício fiscal máximo no
                        IR. O prazo está curto. Posso te mandar a simulação?"
                      </p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-1 bg-white shadow rounded hover:text-indigo-600">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
                      <MessageSquare className="w-4 h-4" /> Enviar no WhatsApp
                    </button>
                    <button className="flex-1 bg-white text-slate-700 border border-slate-200 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                      Simular Aporte
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Timeline Section */}
          {/* {(activeTab === "Linha do Tempo" || activeTab === "Resumo") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Últimos Eventos
              </h3>
              <div className="space-y-6 pl-2">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4">
                    {idx !== timeline.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                    )}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 
                                    ${
                                      event.category === "system"
                                        ? "bg-amber-100 text-amber-600"
                                        : event.category === "meeting"
                                          ? "bg-indigo-100 text-indigo-600"
                                          : "bg-emerald-100 text-emerald-600"
                                    }`}
                    >
                      {event.category === "system" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : event.category === "meeting" ? (
                        <Calendar className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-900">
                          {event.title}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </main>

      {/* COLUMN 3: AI Copilot (Sticky Right) */}
      <aside
        className={`
        fixed md:relative right-0 top-0 bottom-0 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl md:shadow-lg z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isCopilotOpen ? "w-full md:w-80 xl:w-96 translate-x-0" : "w-0 md:w-0 translate-x-full md:translate-x-0 overflow-hidden border-none"}
        ${activeMobileView === "copilot" ? "flex w-full translate-x-0" : ""}
      `}
      >
        {/* Toggle Button for Desktop (Visible when closed or open) */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`hidden md:flex absolute top-1/2 -left-10 w-10 h-20 bg-white border border-r-0 border-slate-200 rounded-l-2xl items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-[-4px_0_10px_rgba(0,0,0,0.05)] group`}
        >
          <ChevronRight
            className={`w-5 h-5 transition-transform duration-500 ${isCopilotOpen ? "rotate-0" : "rotate-180"}`}
          />
        </button>

        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            <h2 className="font-bold tracking-wide">Copilot Anova</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleLive}
              className={`p-2 rounded-full transition-colors ${isLiveActive ? "bg-red-500 animate-pulse" : "bg-white/10 hover:bg-white/20"}`}
            >
              <Mic className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsCopilotOpen(false)}
              className="md:hidden p-2 bg-white/10 rounded-full"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                <span className="text-xs text-slate-400 ml-2">
                  Pensando e buscando dados...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          {/* Quick Prompts */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setChatInput("Gerar relatório PDF")}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Gerar relatório
            </button>
            <button
              onClick={() => setChatInput("Notícias de mercado hoje?")}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <SearchIcon className="w-3 h-3" /> Notícias
            </button>
            <button
              onClick={() => setChatInput("Simular cenário de crise")}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Simular crise
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Pergunte sobre a carteira..."
              className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <label className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                />
              </label>
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
