'use client';

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { FormField } from '@/types/form';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectFieldProps {
  field: FormField;
  registerProps: UseFormRegisterReturn;
  error?: FieldError;
  isRequired?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  field,
  registerProps,
  error,
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
        <p className="text-xs text-slate-500 mb-1.5">
          {field.help_text}
        </p>
      )}

      <div className="relative">
        <select
          id={`field-${field.name}`}
          {...registerProps}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 ${error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
        >
          <option value="" className="text-slate-400">
            {field.placeholder || '-- Silakan Pilih --'}
          </option>
          {field.options?.map(opt => (
            <option key={opt.id || opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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
