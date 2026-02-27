
import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { ClientBook } from './ClientBook';

interface ClientOverlayProps {
  client: Client;
  initialSection?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const ClientOverlay: React.FC<ClientOverlayProps> = ({ 
  client, 
  initialSection = "Resumo",
  onClose, 
  onNext, 
  onPrev,
  hasNext,
  hasPrev 
}) => {
  // Handle Keyboard Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && hasNext) onNext();
    if (e.key === 'ArrowLeft' && hasPrev) onPrev();
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 pb-24 md:pb-28">
      {/* Backdrop with enhanced blur and smooth entry */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Modal Container with Apple-style spring animation */}
      <div className="relative w-full h-full max-w-[1600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-[0.96] fade-in duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ring-1 ring-white/20">
        
        {/* Close Button - Floats top right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-white/50 hover:bg-white rounded-full backdrop-blur-md transition-all shadow-sm group border border-slate-200/50 hover:scale-105 active:scale-95"
          title="Fechar (Esc)"
        >
          <X className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
        </button>

        {/* Navigation Arrows (Floating) - Only visible on desktop to save space on mobile */}
        {hasPrev && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 border border-slate-200 hidden md:flex"
            aria-label="Previous client"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 border border-slate-200 hidden md:flex"
            aria-label="Next client"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Content Area - Wrapper */}
        <div className="w-full h-full overflow-hidden bg-white">
             <ClientBook 
                key={`${client.id}-${initialSection}`} // Force re-mount when client or section changes
                client={client} 
                onBack={onClose} 
                initialSection={initialSection}
             />
        </div>
      </div>
    </div>
  );
};
