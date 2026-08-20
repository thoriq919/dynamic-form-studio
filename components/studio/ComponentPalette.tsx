'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  AlignLeft,
  List,
  Disc,
  Hash,
  Calendar,
  GripVertical,
} from 'lucide-react';
import { FieldType } from '@/types/form';

interface ComponentPaletteProps {
  isPaletteCollapsed: boolean;
  setIsPaletteCollapsed: (collapsed: boolean) => void;
  onPaletteDragStart: (e: React.DragEvent, type: FieldType, label: string, placeholder?: string) => void;
  onInsertComponent: (type: FieldType, label: string, placeholder?: string) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  isPaletteCollapsed,
  setIsPaletteCollapsed,
  onPaletteDragStart,
  onInsertComponent,
}) => {
  const [componentSearch, setComponentSearch] = useState('');
  const [componentCategory, setComponentCategory] = useState<'all' | 'basic' | 'choice' | 'advanced'>('all');

  const componentsList = [
    {
      type: 'free_text' as FieldType,
      label: 'Free Text',
      desc: 'Single line text input.',
      category: 'basic',
      icon: AlignLeft,
      placeholder: 'Enter text...',
    },
    {
      type: 'select' as FieldType,
      label: 'Select',
      desc: 'Dropdown selection menu.',
      category: 'choice',
      icon: List,
      placeholder: 'Select option...',
    },
    {
      type: 'option' as FieldType,
      label: 'Option',
      desc: 'Single choice radio button.',
      category: 'choice',
      icon: Disc,
      placeholder: '',
    },
    {
      type: 'free_text' as FieldType,
      label: 'Number',
      desc: 'Numeric input field.',
      category: 'basic',
      icon: Hash,
      placeholder: 'Enter number...',
    },
    {
      type: 'free_text' as FieldType,
      label: 'Date',
      desc: 'Date picker input.',
      category: 'advanced',
      icon: Calendar,
      placeholder: 'YYYY-MM-DD',
    },
  ];

  const filteredComponents = componentsList.filter(c => {
    const matchesSearch =
      c.label.toLowerCase().includes(componentSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(componentSearch.toLowerCase());
    const matchesCategory = componentCategory === 'all' || c.category === componentCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <aside
      className={`${
        isPaletteCollapsed ? 'w-20 px-3 py-4' : 'w-64 p-4'
      } flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-200 relative`}
    >
      <button
        type="button"
        onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-500 z-40 transition-all hover:scale-110 cursor-pointer ring-2 ring-white"
        title={isPaletteCollapsed ? 'Expand Components' : 'Minimize Components'}
      >
        {isPaletteCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {!isPaletteCollapsed && (
        <div className="flex items-center justify-between px-1 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Components</h2>
          </div>
        </div>
      )}

      {!isPaletteCollapsed && (
        <>
          <div className="relative mb-3 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={componentSearch}
              onChange={e => setComponentSearch(e.target.value)}
              placeholder="Search components..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-semibold text-slate-600 flex-shrink-0">
            {(['all', 'basic', 'choice', 'advanced'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setComponentCategory(cat)}
                className={`flex-1 py-1 rounded-lg capitalize transition ${
                  componentCategory === cat
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={`flex-1 overflow-y-auto space-y-2.5 ${isPaletteCollapsed ? 'flex flex-col items-center pt-2' : ''}`}>
        {filteredComponents.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              draggable={true}
              onDragStart={e => onPaletteDragStart(e, item.type, item.label, item.placeholder)}
              onClick={() => onInsertComponent(item.type, item.label, item.placeholder)}
              className={`${
                isPaletteCollapsed
                  ? 'w-12 h-12 rounded-2xl p-0 flex items-center justify-center'
                  : 'p-3 rounded-2xl'
              } border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 cursor-grab active:cursor-grabbing transition-all duration-150 group shadow-2xs relative`}
              title={`${item.label} (${item.desc})`}
            >
              {!isPaletteCollapsed ? (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-indigo-100/70 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 transition">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                        {item.label}
                      </h4>
                      <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ) : (
                <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
