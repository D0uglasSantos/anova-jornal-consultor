
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Wand2, ArrowRight, User } from 'lucide-react';
import { Metric } from '../types';
import * as GeminiService from '../services/geminiService';

interface MetricOverlayProps {
  metric: Metric;
  onClose: () => void;
  onSelectClient: (id: string) => void;
}

export const MetricOverlay: React.FC<MetricOverlayProps> = ({ metric, onClose, onSelectClient }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(true);

  // Generate AI Insight on mount
  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const prompt = `
          Atue como um analista de dados de Wealth Management sênior.
          Analise a seguinte métrica do consultor:
          Métrica: ${metric.label}
          Valor Atual: ${metric.value}
          Tendência: ${metric.trend} (${metric.trendDirection})
          Contexto: ${metric.description}
          
          Gere um insight estratégico de 2 frases sobre o que isso significa para o negócio do consultor e uma sugestão de ação imediata.
          Seja direto e sofisticado.
        `;
        const result = await GeminiService.analyzeTextFast(prompt);
        setAiInsight(result);
      } catch (error) {
        setAiInsight("Não foi possível gerar insights no momento.");
      } finally {
        setIsLoadingAi(false);
      }
    };
    fetchInsight();
  }, [metric]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-[0.98] duration-300 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{metric.label}</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-serif text-slate-900 tracking-tight">{metric.value}</span>
              <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${
                metric.trendDirection === 'up' ? 'bg-emerald-50 text-emerald-700' :
                metric.trendDirection === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {metric.trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.trend}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6 space-y-8">
          
          {/* Chart Visualization (CSS Bars) */}
          <div className="h-40 flex items-end gap-2">
            {metric.history.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 ${idx === metric.history.length - 1 ? metric.color : 'bg-slate-100 group-hover:bg-slate-200'}`}
                  style={{ height: `${val}%` }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                   {val}%
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight Section */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wand2 className="w-24 h-24 text-indigo-600" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 rounded-lg">
                <Wand2 className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Análise Inteligente</h3>
            </div>
            
            <div className="relative z-10 min-h-[60px]">
              {isLoadingAi ? (
                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"/>
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"/>
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"/>
                   Analisando dados...
                </div>
              ) : (
                <p className="text-indigo-800 text-sm leading-relaxed font-medium">
                  {aiInsight}
                </p>
              )}
            </div>
          </div>

          {/* Breakdown List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Detalhamento & Impacto</h3>
            <div className="space-y-2">
              {metric.breakdown.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                     if (item.clientId) {
                       onSelectClient(item.clientId);
                       onClose();
                     }
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${item.clientId ? 'cursor-pointer hover:bg-indigo-50 group border border-transparent hover:border-indigo-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                     {item.clientId && (
                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                             <User className="w-4 h-4" />
                         </div>
                     )}
                     <div>
                        <span className={`block text-sm font-medium ${item.clientId ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}>{item.label}</span>
                        {item.clientId && <span className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Ver Carteira</span>}
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-slate-900 font-bold text-sm">{item.value}</span>
                    {item.clientId ? (
                         <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    ) : (
                        <span className={`w-2 h-2 rounded-full ${item.impact === 'positive' ? 'bg-emerald-400' : item.impact === 'negative' ? 'bg-rose-400' : 'bg-slate-300'}`}></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
           <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Exportar Relatório
           </button>
        </div>

      </div>
    </div>
  );
};
