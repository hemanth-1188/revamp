import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-xs sm:text-sm font-medium backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-[#FDFAF9]/95 text-[#2E2926] border-[#B5563E]/40'
            : toast.type === 'error'
            ? 'bg-rose-50/95 text-rose-900 border-rose-200'
            : 'bg-white/95 text-[#2E2926] border-[#ECDAD4]'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#B5563E] shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-[#B5563E] shrink-0" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
