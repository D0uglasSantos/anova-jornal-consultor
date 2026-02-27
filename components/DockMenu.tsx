import React from 'react';
import { LayoutGrid, ShieldAlert, TrendingUp, PieChart } from 'lucide-react';
import { ViewContext } from '../types';

interface DockMenuProps {
  activeContext: ViewContext;
  onSelectContext: (ctx: ViewContext) => void;
}

export const DockMenu: React.FC<DockMenuProps> = ({ activeContext, onSelectContext }) => {
  const items = [
    { id: 'ALL', label: 'Jornal', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'PENSION', label: 'Previdência', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'CHURN', label: 'Risco', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'PORTFOLIO', label: 'Carteira', icon: <PieChart className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-[70] w-[95%] max-w-lg">
      <div className="flex items-center justify-around md:justify-center gap-1 md:gap-2 p-1.5 md:p-2 bg-white/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl ring-1 ring-black/10 transition-transform duration-300 hover:scale-[1.02]">
        {items.map((item) => {
          const isActive = activeContext === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectContext(item.id)}
              className={`
                relative flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 group flex-1 md:flex-none
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-lg scale-105' 
                  : 'text-slate-500 hover:bg-slate-100 hover:scale-105 hover:text-slate-900'
                }
              `}
            >
              {item.icon}
              <span className={`
                text-[10px] md:text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                ${isActive ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0 md:group-hover:w-auto md:group-hover:opacity-100 md:group-hover:ml-1'}
              `}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full opacity-50"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};