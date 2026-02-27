import React, { useState, useEffect } from 'react';
import { X, Mic, Send, Sparkles, MessageSquare, Brain, Calendar, Target, ShieldCheck, LucideIcon } from 'lucide-react';
import { Agent } from '../types';
import * as GeminiService from '../services/geminiService';

interface AgentCommandCenterProps {
  agent: Agent;
  onClose: () => void;
}

const IconMap: Record<string, LucideIcon> = {
  Brain, Calendar, Target, ShieldCheck
};

export const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({ agent, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const Icon = IconMap[agent.iconName];

  // Initial greeting
  useEffect(() => {
    setHistory([{
        role: 'model',
        text: `Olá. Sou ${agent.name}, seu ${agent.title}. Como posso ajudar hoje?`
    }]);
  }, [agent]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const newHistory = [...history, { role: 'user' as const, text }];
    setHistory(newHistory);
    setInput('');
    setIsThinking(true);

    try {
        // Construct a persona-based system instruction implicitly via context
        const contextPrompt = `
            Você é ${agent.name}, um agente de IA especializado em: ${agent.title}.
            Sua função principal: ${agent.description}.
            Responda como um funcionário sênior, eficiente e focado em resultados.
            Contexto do usuário: ${text}
        `;
        
        // We use the simpler sendMessage from GeminiService but prepend context
        // In a real app, this would be a systemInstruction in the config
        const apiHistory = newHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        // Inject context into the last message for the API call to ensure persona
        const response = await GeminiService.sendMessage(
            apiHistory.slice(0, -1), // history without last
            contextPrompt, // last message with context wrapper
            true // Use thinking for "Agent" tasks which are usually complex
        );

        setHistory(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
        setHistory(prev => [...prev, { role: 'model', text: "Desculpe, encontrei um erro ao processar sua solicitação." }]);
    } finally {
        setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Window */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header - Agent Identity */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${agent.color} text-white`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{agent.name}</h2>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{agent.title}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isThinking && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full animate-bounce ${agent.color.replace('bg-', 'bg-')}`}></div>
                         <div className={`w-2 h-2 rounded-full animate-bounce delay-75 ${agent.color.replace('bg-', 'bg-')}`}></div>
                         <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${agent.color.replace('bg-', 'bg-')}`}></div>
                         <span className="text-xs text-slate-400 font-medium">Trabalhando nisso...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Input & Quick Actions */}
        <div className="p-6 bg-white border-t border-slate-100">
            
            {/* Quick Actions Chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                {agent.capabilities.map((cap, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(`Por favor, ${cap.toLowerCase()}.`)}
                        className="flex-shrink-0 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-1.5"
                    >
                        <Sparkles className="w-3 h-3" />
                        {cap}
                    </button>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Dê um comando para ${agent.name}...`}
                    className="w-full pl-5 pr-28 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-medium text-slate-700"
                />
                <div className="absolute right-3 top-3 flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                        <Mic className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
