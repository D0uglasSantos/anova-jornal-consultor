
import React from 'react';
import { X, Info } from 'lucide-react';

interface ServiceModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceModelInfoModal: React.FC<ServiceModelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Modelos de Atendimento</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Consultoria */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Consultoria</h3>
            </div>
            <div className="pl-11 space-y-4 text-zinc-600 leading-relaxed">
              <p>
                O parceiro <span className="font-bold text-zinc-900">recomenda</span> os investimentos, mas <span className="font-bold text-zinc-900">o cliente mantém o controle da conta</span>.
              </p>
              <p>
                As ordens <span className="font-bold text-zinc-900">precisam ser aprovadas pelo cliente no app até o final do dia</span>. Caso expirem, é necessário criar uma nova ordem.
              </p>
              <p>
                O cliente pode investir por conta própria, conta permanece livre para isso.
              </p>
              <p>
                Remuneração: <span className="font-bold text-zinc-900">taxa de gestão</span>.
              </p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Gestora */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Gestora</h3>
            </div>
            <div className="pl-11 space-y-4 text-zinc-600 leading-relaxed">
              <p>
                O parceiro assume <span className="font-bold text-zinc-900">100% da gestão da conta do cliente</span>.
              </p>
              <p>
                As ordens são <span className="font-bold text-zinc-900">executadas automaticamente</span>, sem necessidade de aprovação individual.
              </p>
              <p>
                O cliente <span className="font-bold text-zinc-900">delega formalmente</span> a tomada de decisão ao parceiro.
              </p>
              <p>
                Remuneração: <span className="font-bold text-zinc-900">taxa de administração + taxa de performance</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-100 flex justify-end bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
