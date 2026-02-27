
import React from 'react';
import { X, QrCode, Smartphone, CheckCircle2, Zap, Lock, RefreshCw, Shield, Globe } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-[0.98] flex flex-col md:flex-row h-[600px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">Configurações</h2>
            
            <button className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 shadow-sm rounded-xl font-medium border border-slate-200">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                Conexões
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                <Zap className="w-5 h-5" />
                Autopilot Global
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                <Shield className="w-5 h-5" />
                Segurança
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Conexão WhatsApp Business</h3>
                    <p className="text-slate-500 text-sm">Gerencie a conexão da IA com seu número corporativo.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                    <div className="relative group">
                        <div className="w-56 h-56 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                            <QrCode className="w-24 h-24 text-white opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-mono text-xs opacity-50">QR CODE PLACEHOLDER</span>
                            </div>
                            {/* Scanning Animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                        Conectado
                    </div>
                    <p className="text-xs text-slate-400">Última sincronização: Há 2 minutos</p>
                </div>

                {/* Status & Rules */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-500" /> Status do Sistema
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Latência da IA</span>
                                <span className="text-emerald-600 font-mono font-bold">42ms</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Mensagens Processadas (Hoje)</span>
                                <span className="text-slate-900 font-bold">128</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Fila de Resposta</span>
                                <span className="text-slate-900 font-bold">Vazia</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-500" /> Regras Globais
                        </h4>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-600">Interceptar Áudios &gt; 1min</span>
                            <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Auto-transcrição de Calls</span>
                            <div className="w-10 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Reiniciar Serviço de Mensageria
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
