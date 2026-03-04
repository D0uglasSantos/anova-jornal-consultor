
import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, Loader2 } from 'lucide-react';
import { ServiceModelInfoModal } from './ServiceModelInfoModal';
import { RegistrationSuccessModal } from './RegistrationSuccessModal';
import { apiRequest } from '../services/api';

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  userData: any;
}

const BROKERS = [
  'XP',
  'BTG',
  'Avenue',
  'BTG Global',
  'XP Internacional',
  'Safra'
];

const CONSULTORIA_BROKERS = [
  'XP',
  'BTG',
  'Avenue'
];

const PORTFOLIOS_STANDARD = [
  'Start',
  'Strategy',
  'Carteira Personalizada'
];

const PORTFOLIOS_INTERNATIONAL = [
  'ANR PREV PRO USA'
];

const PERFORMANCE_INDEXES = [
  'IBOV',
  'CDI',
  'CDI-103%',
  'S&P'
];

export const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({ isOpen, onClose, onSave, userData }) => {
  const [serviceModel, setServiceModel] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [performanceFee, setPerformanceFee] = useState('');
  const [performanceIndex, setPerformanceIndex] = useState('');
  const [broker, setBroker] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ url: string } | null>(null);

  const availableBrokers = serviceModel === 'Consultoria' ? CONSULTORIA_BROKERS : BROKERS;

  // Reset broker if it becomes invalid for the selected service model
  useEffect(() => {
    if (serviceModel === 'Consultoria' && broker && !CONSULTORIA_BROKERS.includes(broker)) {
      setBroker('');
    }
  }, [serviceModel]);

  // Reset portfolio if broker changes and current portfolio is invalid for new broker
  useEffect(() => {
    const isInternational = ['BTG Global', 'Avenue', 'XP Internacional'].includes(broker);
    if (isInternational) {
      setPortfolio('ANR PREV PRO USA');
    } else if (portfolio === 'ANR PREV PRO USA') {
      setPortfolio('');
    }
  }, [broker]);

  if (!isOpen) return null;

  const isInternationalBroker = ['BTG Global', 'Avenue', 'XP Internacional'].includes(broker);
  const portfolios = isInternationalBroker ? PORTFOLIOS_INTERNATIONAL : PORTFOLIOS_STANDARD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const id_hub = userData?.id_partner || 0;
      const id_cadastro = userData?.id_registro || 0;
      
      const payload = {
        id_hub: id_hub,
        id_cadastro: id_cadastro,
        gestora: serviceModel === 'Gestora (Wealth)' ? 1 : 3,
        taxa_gestao: parseFloat(managementFee.replace(',', '.')) || 0,
        taxa_performance: parseFloat(performanceFee.replace(',', '.')) || 0,
        carteira: portfolio,
        conta: accountNumber,
        corretora: broker,
        indice_performance: performanceIndex
      };

      const data = await apiRequest('/link-hub/cadastro-cliente/links', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessData({ url: data.url });
      onSave(data);
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Erro ao gerar link de cadastro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Pré-cadastro</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Modelo de Atendimento */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
              Modelo de Atendimento <span className="text-red-500">*</span>
              <button 
                type="button"
                onClick={() => setIsInfoModalOpen(true)}
                className="p-0.5 text-zinc-300 hover:text-zinc-500 transition-colors"
              >
                <Info className="w-4 h-4 cursor-pointer" />
              </button>
            </label>
            <div className="relative">
              <select
                required
                value={serviceModel}
                onChange={(e) => setServiceModel(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all appearance-none"
              >
                <option value="" disabled>Selecione o modelo</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Gestora (Wealth)">Gestora (Wealth)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Taxa de Gestão */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Taxa de Gestão (%)</label>
            <input
              type="text"
              placeholder="0,00%"
              value={managementFee}
              onChange={(e) => setManagementFee(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
            />
          </div>

          {/* Conditional Fields for Gestora (Wealth) */}
          {serviceModel === 'Gestora (Wealth)' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Taxa de Performance (%)</label>
                <input
                  type="text"
                  placeholder="0,00%"
                  value={performanceFee}
                  onChange={(e) => setPerformanceFee(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Índice de Performance</label>
                <div className="relative">
                  <select
                    value={performanceIndex}
                    onChange={(e) => setPerformanceIndex(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Selecione o índice</option>
                    {PERFORMANCE_INDEXES.map(idx => (
                      <option key={idx} value={idx}>{idx}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* Corretora */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Corretora</label>
            <div className="relative">
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all appearance-none"
              >
                <option value="" disabled>Selecione a corretora</option>
                {availableBrokers.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Carteira */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Carteira</label>
            <div className="relative">
              <select
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                disabled={isInternationalBroker}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all appearance-none disabled:bg-zinc-50 disabled:text-zinc-500"
              >
                <option value="" disabled>Selecione a carteira</option>
                {portfolios.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Número da Conta */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Número da Conta</label>
            <input
              type="text"
              placeholder="Digite o número da conta (opcional)"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-white hover:border-zinc-300 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !serviceModel}
            className="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar e Continuar
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>

      <ServiceModelInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />

      <RegistrationSuccessModal 
        isOpen={!!successData}
        url={successData?.url || ''}
        onClose={() => {
          setSuccessData(null);
          onClose();
        }}
      />
    </div>
  );
};
