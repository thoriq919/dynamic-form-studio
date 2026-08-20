'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Trash2,
  Save,
  Copy,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'delete';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const duration = toast.duration || 3500;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onDismiss, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onDismiss, 200);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'delete':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Trash2 className="w-4 h-4" />
          </div>
        );
      case 'error':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div
      className={`pointer-events-auto bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 flex items-start gap-3.5 transition-all duration-200 ${
        isClosing ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100 animate-slideInRight'
      }`}
    >
      {getIcon()}

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug break-words">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition -mr-1 -mt-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
