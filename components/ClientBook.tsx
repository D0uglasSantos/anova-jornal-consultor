
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Phone, Mail, Calendar, TrendingUp, AlertCircle, 
  MessageSquare, Mic, Send, Paperclip, FileText, CheckCircle2, 
  Play, Pause, Wand2, Search as SearchIcon, QrCode, Smartphone,
  Zap, Sliders, Lock, Unlock, Target, ArrowRightLeft, DollarSign,
  ChevronRight, ChevronDown, Check, Brain, Smile, User
} from 'lucide-react';
import { Client, TriggerType, ChatMessage, TimelineEvent, Priority, AutopilotConfig, FinancialGoal, AllocationOrder } from '../types';
import * as GeminiService from '../services/geminiService';

interface ClientBookProps {
  client: Client;
  initialSection?: string;
  onBack: () => void;
}

// --- Autopilot Mock Data Helper ---
const getMockAutopilot = (): AutopilotConfig => ({
  trustScore: 72,
  rationale: [
    "Alta consistência nas interações de e-mail (95% de aceitação).",
    "Falta de dados de voz recentes para calibração fina de tom.",
    "Cliente respondeu positivamente à última sugestão de rebalanceamento."
  ],
  permissions: {
    autoSchedule: true,
    sendMarketUpdates: true,
    birthdayGreetings: true,
    portfolioRebalancing: false,
  },
  settings: {
    tone: 'formal',
    periodicity: 'weekly',
  }
});

const getMockGoals = (): FinancialGoal[] => [
  { id: '1', title: 'Independência Financeira', category: 'Aposentadoria', currentAmount: 2400000, targetAmount: 5000000, deadline: '2035', status: 'on_track' },
  { id: '2', title: 'Imóvel no Exterior', category: 'Patrimônio', currentAmount: 350000, targetAmount: 1200000, deadline: '2028', status: 'at_risk' },
  { id: '3', title: 'Faculdade dos Filhos', category: 'Educação', currentAmount: 180000, targetAmount: 400000, deadline: '2030', status: 'on_track' },
];

const getMockOrders = (): AllocationOrder[] => [
  { id: '101', asset: 'Tesouro IPCA+ 2035', ticker: 'NTNB35', type: 'buy', amount: 50000, status: 'executed', date: '2023-10-25' },
  { id: '102', asset: 'Veneza FI Multimercado', ticker: 'VENEZA', type: 'sell', amount: 25000, status: 'pending', date: '2023-10-28' },
];

export const ClientBook: React.FC<ClientBookProps> = ({ client, initialSection, onBack }) => {
  const [activeTab, setActiveTab] = useState(initialSection || 'Resumo');
  const [activeMobileView, setActiveMobileView] = useState<'profile' | 'content' | 'copilot'>('content');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Olá! Estou analisando a carteira de ${client.name}. O gatilho de ${client.mainTrigger.type} é prioritário hoje. Como posso ajudar?`, timestamp: new Date() }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  // Autopilot State
  const [autopilot, setAutopilot] = useState<AutopilotConfig>(client.autopilot || getMockAutopilot());
  const [showAutopilotModal, setShowAutopilotModal] = useState(false);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<{ disconnect: () => Promise<void> } | null>(null);

  // Additional Data
  const goals = client.goals || getMockGoals();
  const orders = client.orders || getMockOrders();

  // Timeline Mock Data
  const timeline: TimelineEvent[] = [
    { id: '1', date: 'Hoje', title: 'Alerta de Previdência', description: 'Contribuição anual abaixo do teto fiscal.', category: 'system' },
    { id: '2', date: '15 Out', title: 'Reunião Semestral', description: 'Revisão de alocação e objetivos.', category: 'meeting' },
    { id: '3', date: '02 Out', title: 'Aporte Recebido', description: 'R$ 50.000,00 em CDB Liquidez Diária.', category: 'transaction' },
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const needsThinking = chatInput.toLowerCase().includes('analise') || chatInput.toLowerCase().includes('estratégia');
      const response = await GeminiService.sendMessage(history, userMsg.text, needsThinking);
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text, 
        timestamp: new Date() 
      };
      if (response.webSources && response.webSources.length > 0) {
        botMsg.text += `\n\nFontes:\n${response.webSources.map(url => `- ${url}`).join('\n')}`;
      }
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro ao processar.", timestamp: new Date() }]);
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
        () => setIsLiveActive(false)
      );
      if (session) liveSessionRef.current = session;
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
  }

  const handleTTS = async (text: string) => {
      setIsPlaying(true);
      const buffer = await GeminiService.speakText(text);
      if (buffer) playAudioBuffer(buffer);
      setIsPlaying(false);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Placeholder for file logic
  }

  // --- Render Sections ---

  const renderAutopilotModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAutopilotModal(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-[0.98]">
        <div className="bg-slate-900 px-6 py-6 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl font-bold">Autopilot Command Center</h2>
            </div>
            <p className="text-slate-400 text-sm">Configuração de autonomia da IA</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold font-serif">{autopilot.trustScore}</div>
             <div className="text-xs text-slate-400 uppercase tracking-wider">Trust Score</div>
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
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
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
                <div key={key} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <button 
                    onClick={() => setAutopilot(prev => ({
                        ...prev, permissions: { ...prev.permissions, [key]: !enabled }
                    }))}
                    className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
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
                   <label className="text-xs text-slate-500 font-bold block mb-2">Tom de Voz</label>
                   <select 
                      value={autopilot.settings.tone}
                      onChange={(e) => setAutopilot(prev => ({ ...prev, settings: { ...prev.settings, tone: e.target.value as any } }))}
                      className="w-full text-sm bg-slate-50 border-none rounded-lg focus:ring-0"
                   >
                      <option value="formal">Formal</option>
                      <option value="neutral">Neutro</option>
                      <option value="casual">Casual</option>
                   </select>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl">
                   <label className="text-xs text-slate-500 font-bold block mb-2">Periodicidade</label>
                   <select 
                      value={autopilot.settings.periodicity}
                      onChange={(e) => setAutopilot(prev => ({ ...prev, settings: { ...prev.settings, periodicity: e.target.value as any } }))}
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
           <button onClick={() => setShowAutopilotModal(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">
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
                <span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">Hoje</span>
             </div>

             <div className="flex justify-start">
                <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-slate-700 text-sm">Bom dia! Poderia me enviar a lâmina daquele fundo multimercado que comentamos?</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">10:42</span>
                </div>
             </div>

             <div className="flex justify-end">
                <div className="max-w-[70%] bg-emerald-600 text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
                    <p className="text-sm">Olá {client.name.split(' ')[0]}, tudo bem? Claro! Segue abaixo a lâmina do Fundo Veneza. Recomendo também agendarmos uma call para discutir a estratégia.</p>
                    <div className="mt-3 bg-white/10 rounded-lg p-3 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-white/80" />
                        <div>
                            <p className="text-xs font-bold">Veneza_Multimercado_Out23.pdf</p>
                            <p className="text-[10px] opacity-70">2.4 MB • PDF</p>
                        </div>
                    </div>
                    <span className="text-[10px] text-emerald-100 mt-2 block text-right">10:45 • Enviado</span>
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
                            <span className="text-[10px] text-slate-400 mt-1 block">0:24</span>
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
               <h4 className="text-xs text-slate-500 font-bold uppercase">Patrimônio Atual</h4>
               <p className="text-2xl font-serif font-bold text-slate-900 mt-1">
                 {client.fullData?.patrimonio_liquido 
                   ? `R$ ${client.fullData.patrimonio_liquido.toLocaleString()}` 
                   : client.aum}
               </p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <h4 className="text-xs text-slate-500 font-bold uppercase">Meta Principal</h4>
               <p className="text-2xl font-serif font-bold text-indigo-600 mt-1">R$ 5.0M</p>
               <p className="text-xs text-slate-400 mt-1">Independência Financeira</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <h4 className="text-xs text-slate-500 font-bold uppercase">Progresso Global</h4>
               <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">48%</p>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[48%]" />
               </div>
            </div>
        </div>

        {/* Goals List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" /> Objetivos de Vida (CFP)
               </h3>
               <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  + Novo Objetivo
               </button>
            </div>
            <div className="divide-y divide-slate-100">
               {goals.map(goal => {
                  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  return (
                     <div key={goal.id} className="p-6 hover:bg-slate-50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-slate-900 text-lg">{goal.title}</h4>
                                 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{goal.category}</span>
                              </div>
                              <p className="text-sm text-slate-500">Prazo: {goal.deadline}</p>
                           </div>
                           <div className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                              goal.status === 'on_track' ? 'bg-emerald-100 text-emerald-700' : 
                              goal.status === 'at_risk' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                           }`}>
                              {goal.status.replace('_', ' ')}
                           </div>
                        </div>
                        
                        <div className="relative pt-2">
                           <div className="flex justify-between text-sm font-medium mb-1.5">
                              <span className="text-slate-600">R$ {goal.currentAmount.toLocaleString()}</span>
                              <span className="text-slate-900">R$ {goal.targetAmount.toLocaleString()}</span>
                           </div>
                           <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full rounded-full transition-all duration-1000 ${
                                    goal.status === 'at_risk' ? 'bg-amber-500' : 'bg-indigo-600'
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

  const renderAllocation = () => (
    <div className="space-y-6">
       {/* Order Entry */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
             <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Central de Alocação
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ativo / Produto</label>
                <div className="relative">
                   <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                   <input type="text" placeholder="Buscar ticker ou nome..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Operação</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500">
                   <option value="buy">Comprar / Aplicar</option>
                   <option value="sell">Vender / Resgatar</option>
                </select>
             </div>
             <div>
                <button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                   Criar Ordem
                </button>
             </div>
          </div>
       </div>

       {/* Orders List */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
             <h4 className="font-bold text-slate-700 text-sm">Ordens Recentes</h4>
          </div>
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                   <th className="px-6 py-3">Data</th>
                   <th className="px-6 py-3">Ativo</th>
                   <th className="px-6 py-3">Tipo</th>
                   <th className="px-6 py-3 text-right">Valor</th>
                   <th className="px-6 py-3 text-center">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                   <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{order.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                         {order.asset} <span className="text-slate-400 font-normal ml-1">({order.ticker})</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-xs font-bold uppercase ${order.type === 'buy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {order.type === 'buy' ? 'Compra' : 'Venda'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                         R$ {order.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.status === 'executed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                         }`}>
                            {order.status === 'executed' && <Check className="w-3 h-3" />}
                            {order.status === 'pending' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 overflow-hidden relative">
      
      {showAutopilotModal && renderAutopilotModal()}

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white z-20">
        <button 
          onClick={() => setActiveMobileView('profile')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === 'profile' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
        >
          Perfil
        </button>
        <button 
          onClick={() => setActiveMobileView('content')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === 'content' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
        >
          {activeTab}
        </button>
        <button 
          onClick={() => setActiveMobileView('copilot')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeMobileView === 'copilot' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
        >
          Copilot
        </button>
      </div>

      {/* COLUMN 1: Profile & Navigation (Sticky Left) */}
      <aside className={`
        w-full md:w-72 lg:w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm
        ${activeMobileView === 'profile' ? 'flex' : 'hidden md:flex'}
      `}>
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
                <h2 className="mt-4 text-xl font-bold text-slate-900">{client.fullData?.nome_completo || client.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">{client.fullData?.classificacao_investidor || client.profile}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{client.lifeStage}</span>
                </div>
            </div>
            <div className="mt-6 flex justify-around">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title={client.fullData?.celular}><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title={client.fullData?.email}><Mail className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"><Calendar className="w-5 h-5" /></button>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {['Resumo', 'Linha do Tempo', 'Planejamento', 'Carteira', 'Alocação', 'Mensageria', 'Previdência', 'Renda Fixa', 'Caixa'].map((item) => (
                <button
                    key={item}
                    onClick={() => {
                        setActiveTab(item);
                        if (window.innerWidth < 768) setActiveMobileView('content');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                        activeTab === item 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        {item === 'Mensageria' && <MessageSquare className="w-4 h-4" />}
                        {item === 'Planejamento' && <Target className="w-4 h-4" />}
                        {item === 'Alocação' && <ArrowRightLeft className="w-4 h-4" />}
                        {item}
                    </span>
                    {item === 'Previdência' && client.mainTrigger.type === TriggerType.PENSION && (
                        <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>
                    )}
                </button>
            ))}
        </nav>
      </aside>

      {/* COLUMN 2: Main Content (Scrollable Center) */}
      <main className={`
        flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 scroll-smooth pb-32
        ${activeMobileView === 'content' ? 'block' : 'hidden md:block'}
      `}>
        <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header of Section */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 font-serif">{activeTab}</h1>
                <div className="flex gap-2">
                    <span className="text-xs md:text-sm text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="hidden sm:inline">Sincronizado:</span> 09:41
                    </span>
                </div>
            </div>

            {/* Content Rendering Switch */}
            {activeTab === 'Mensageria' && renderMessaging()}
            {activeTab === 'Planejamento' && renderPlanning()}
            {activeTab === 'Alocação' && renderAllocation()}

            {/* Dados Cadastrais Section */}
            {activeTab === 'Resumo' && client.fullData && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" /> Dados Cadastrais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">CPF</p>
                            <p className="text-slate-900 font-medium">{client.fullData.cpf}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Data de Nascimento</p>
                            <p className="text-slate-900 font-medium">{client.fullData.data_nascimento}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Estado Civil</p>
                            <p className="text-slate-900 font-medium">{client.fullData.estado_civil}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Classificação</p>
                            <p className="text-slate-900 font-medium">{client.fullData.classificacao_investidor}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Patrimônio Líquido</p>
                            <p className="text-slate-900 font-medium">R$ {client.fullData.patrimonio_liquido?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Rendimento Mensal</p>
                            <p className="text-slate-900 font-medium">R$ {client.fullData.rendimento_mensal?.toLocaleString()}</p>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 space-y-1">
                            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Endereço</p>
                            <p className="text-slate-900 font-medium">
                                {client.fullData.endereco}, {client.fullData.numero_endereco} {client.fullData.complemento_endereco && `- ${client.fullData.complemento_endereco}`}
                                <br />
                                {client.fullData.bairro_endereco} - {client.fullData.cidade_endereco}/{client.fullData.estado_endereco} - CEP: {client.fullData.cep}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Existing Contextual Content for 'Resumo' etc. */}
            {client.mainTrigger.type === TriggerType.PENSION && (activeTab === 'Resumo' || activeTab === 'Previdência') && (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-orange-900">Atenção: Benefício Fiscal em Risco</h3>
                            <p className="text-orange-800/80 mt-1 text-sm">
                                {client.name} ainda pode aportar <strong className="font-semibold">R$ 12.500,00</strong> em PGBL para maximizar a dedução de IR deste ano.
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Diagnóstico da IA</h4>
                            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                                <p>
                                    Baseado na renda declarada de R$ 350k/ano, o teto de 12% para PGBL é R$ 42k. O cliente aportou apenas R$ 29.5k até agora. 
                                    Aportar a diferença gera uma restituição estimada de R$ 3.437,50 (alíquota 27.5%).
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sugestão de Mensagem</h4>
                                <button 
                                    onClick={() => handleTTS(`Olá ${client.name}. Analisei seu planejamento tributário e notei uma oportunidade importante. Você ainda tem espaço para aportar doze mil e quinhentos reais em P G B L e garantir o benefício fiscal máximo. Posso enviar uma simulação?`)}
                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"
                                >
                                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} Ouvir
                                </button>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 relative group">
                                <p className="text-slate-600 italic">
                                    "Olá, {client.name.split(' ')[0]}! Tudo bem? Estava revisando seu planejamento tributário e notei uma oportunidade. 
                                    Você ainda tem espaço para aportar R$ 12.5k em PGBL e garantir o benefício fiscal máximo no IR. 
                                    O prazo está curto. Posso te mandar a simulação?"
                                </p>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button className="p-1 bg-white shadow rounded hover:text-indigo-600"><FileText className="w-4 h-4" /></button>
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
            {(activeTab === 'Linha do Tempo' || activeTab === 'Resumo') && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Últimos Eventos</h3>
                    <div className="space-y-6 pl-2">
                        {timeline.map((event, idx) => (
                            <div key={event.id} className="relative flex gap-4">
                                {/* Vertical Line */}
                                {idx !== timeline.length - 1 && (
                                    <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                                )}
                                
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 
                                    ${event.category === 'system' ? 'bg-amber-100 text-amber-600' : 
                                      event.category === 'meeting' ? 'bg-indigo-100 text-indigo-600' : 
                                      'bg-emerald-100 text-emerald-600'}`}>
                                    {event.category === 'system' ? <AlertCircle className="w-5 h-5" /> : 
                                     event.category === 'meeting' ? <Calendar className="w-5 h-5" /> : 
                                     <CheckCircle2 className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                        <span className="text-xs text-slate-400 font-medium">{event.date}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Chart Placeholder for Portfolio */}
            {activeTab === 'Carteira' && (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20">
                     <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                     </div>
                     <h3 className="text-lg font-semibold text-slate-800">Visualização da Carteira</h3>
                     <p className="text-slate-500">Gráficos de alocação seriam renderizados aqui.</p>
                 </div>
            )}
        </div>
      </main>

      {/* COLUMN 3: AI Copilot (Sticky Right) */}
      <aside className={`
        w-full md:w-80 xl:w-96 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20
        ${activeMobileView === 'copilot' ? 'flex' : 'hidden md:flex'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
            <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                <h2 className="font-bold tracking-wide">Copilot Anova</h2>
            </div>
            <div className="flex gap-2">
                 <button onClick={toggleLive} className={`p-2 rounded-full transition-colors ${isLiveActive ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}>
                    <Mic className="w-4 h-4 text-white" />
                 </button>
            </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                    }`}>
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
                        <span className="text-xs text-slate-400 ml-2">Pensando e buscando dados...</span>
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
                     <SearchIcon className="w-3 h-3"/> Notícias
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre a carteira..."
                    className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                     <label className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                        <Paperclip className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
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
