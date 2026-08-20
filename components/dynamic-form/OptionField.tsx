'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { FormField } from '@/types/form';
import { AlertCircle } from 'lucide-react';

interface OptionFieldProps {
  field: FormField;
  registerProps: UseFormRegisterReturn;
  error?: FieldError;
  currentValue?: string;
  isRequired?: boolean;
}

export const OptionField: React.FC<OptionFieldProps> = ({
  field,
  registerProps,
  error,
  currentValue,
  isRequired,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        <span>{field.label}</span>
        {isRequired ? (
          <span className="text-rose-500 font-bold ml-1" title="Wajib diisi">
            *
          </span>
        ) : (
          <span className="text-slate-400 font-normal text-xs ml-1.5">(Opsional)</span>
        )}
      </label>

      {field.help_text && (
        <p className="text-xs text-slate-500 mb-2">
          {field.help_text}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {field.options?.map(opt => {
          const isSelected = currentValue === opt.value;
          return (
            <label
              key={opt.id || opt.value}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...registerProps}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-500 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};
