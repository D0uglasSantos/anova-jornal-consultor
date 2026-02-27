import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Client, TriggerType, ViewState } from '../types';

interface TriggerListProps {
  triggerType: TriggerType;
  clients: Client[];
  onNavigate: (state: ViewState) => void;
  onBack: () => void;
}

export const TriggerList: React.FC<TriggerListProps> = ({ triggerType, clients, onNavigate, onBack }) => {
  const filteredClients = clients.filter(c => c.mainTrigger.type === triggerType);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-slate-900">
            {triggerType}
            <span className="ml-3 text-lg font-sans font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {filteredClients.length} clientes
            </span>
        </h1>
      </div>

      <div className="grid gap-4">
        {filteredClients.map(client => (
          <div 
            key={client.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all flex items-center gap-6"
          >
            <img src={client.avatarUrl} alt={client.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-50" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-900 truncate">{client.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  client.mainTrigger.priority === 'Alta' ? 'bg-red-50 text-red-700' : 
                  client.mainTrigger.priority === 'Média' ? 'bg-amber-50 text-amber-700' : 
                  'bg-emerald-50 text-emerald-700'
                }`}>
                  Prioridade {client.mainTrigger.priority}
                </span>
              </div>
              <p className="text-slate-600 text-sm">{client.mainTrigger.description}</p>
            </div>

            <button 
              onClick={() => onNavigate({ type: 'CLIENT_BOOK', clientId: client.id, section: client.mainTrigger.type })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors whitespace-nowrap"
            >
              Abrir Livro <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
