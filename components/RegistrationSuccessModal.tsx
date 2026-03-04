
import React from 'react';
import { X, Check, Copy, Info } from 'lucide-react';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Link Gerado com Sucesso!</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white/50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-zinc-600 leading-relaxed">
            O link de cadastro foi gerado com sucesso! Copie e envie para o cliente:
          </p>

          <div className="flex gap-3">
            <div className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 text-sm truncate">
              {url}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-4">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Este link contém as configurações pré-cadastrais que você definiu. Quando o cliente acessar, os dados já estarão preenchidos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-end bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#1e293b] text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
