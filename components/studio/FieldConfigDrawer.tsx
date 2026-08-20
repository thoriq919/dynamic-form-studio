'use client';

import React from 'react';
import {
  SlidersHorizontal,
  X,
  GitBranch,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ListOrdered,
} from 'lucide-react';
import { FormConfig, FormField, FieldRule, RuleOperator } from '@/types/form';

interface FieldConfigDrawerProps {
  form: FormConfig;
  selectedField: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
  onClose: () => void;
  configTab?: any;
  setConfigTab?: any;
}

export const FieldConfigDrawer: React.FC<FieldConfigDrawerProps> = ({
  form,
  selectedField,
  onUpdateField,
  onClose,
}) => {
  if (!selectedField) return null;

  const isChoiceField = selectedField.type === 'select' || selectedField.type === 'option';
  const hasConditionalRule = Boolean(selectedField.rules && selectedField.rules.length > 0);
  const currentVisibility = selectedField.status === 'hide' ? 'hide' : 'show';

  const handleToggleConditionalDisplay = (enabled: boolean) => {
    if (!enabled) {
      onUpdateField({
        rules: [],
        parent_id: null,
      });
    } else {
      const otherFields = form.fields.filter(f => f.id !== selectedField.id);
      const defaultSource = otherFields[0];
      const defaultSourceId = defaultSource?.id || '';
      const defaultVal = defaultSource?.options?.[0]?.value || 'value';

      const newRule: FieldRule = {
        id: Date.now(),
        field_id: selectedField.id,
        source_field_id: defaultSourceId,
        operator: 'equals',
        value: defaultVal,
        action: 'show',
      };

      onUpdateField({
        rules: [newRule],
        parent_id: defaultSourceId ? (Number(defaultSourceId) || defaultSourceId) : null,
      });
    }
  };

  const activeRule = selectedField.rules?.[0];

  const handleUpdateRule = (updates: Partial<FieldRule>) => {
    if (!activeRule) return;
    const updatedRule = { ...activeRule, ...updates };

    let parentId = selectedField.parent_id;
    if (updates.source_field_id) {
      parentId = Number(updates.source_field_id) || updates.source_field_id;
    }

    onUpdateField({
      rules: [updatedRule],
      parent_id: parentId,
    });
  };

  const handleAddOption = () => {
    const currentOptions = selectedField.options || [];
    const nextIndex = currentOptions.length + 1;
    const newOpt = {
      id: Date.now(),
      label: `Option ${nextIndex}`,
      value: `opt_${nextIndex}`,
      sort_order: nextIndex,
    };
    onUpdateField({
      options: [...currentOptions, newOpt],
    });
  };

  const handleUpdateOption = (index: number, key: 'label' | 'value', val: string) => {
    const currentOptions = [...(selectedField.options || [])];
    if (currentOptions[index]) {
      currentOptions[index] = {
        ...currentOptions[index],
        [key]: val,
        ...(key === 'label' && !currentOptions[index].value.startsWith('custom_')
          ? { value: val.toLowerCase().replace(/[^a-z0-9]/g, '_') }
          : {}),
      };
      onUpdateField({ options: currentOptions });
    }
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = (selectedField.options || []).filter((_, i) => i !== index);
    onUpdateField({ options: currentOptions });
  };

  const otherFields = form.fields.filter(f => f.id !== selectedField.id);
  const selectedSourceField = form.fields.find(
    f => String(f.id) === String(activeRule?.source_field_id) || f.name === activeRule?.source_field_id
  );

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col z-20 overflow-y-auto animate-fadeIn shadow-xs">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900">Field Configuration</h3>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
            {selectedField.type === 'free_text' ? 'TEXT' : selectedField.type}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 text-xs">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Field Label</label>
            <input
              type="text"
              value={selectedField.label}
              onChange={e => onUpdateField({ label: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Variable Name</label>
            <input
              type="text"
              value={selectedField.name}
              onChange={e =>
                onUpdateField({
                  name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Placeholder</label>
            <input
              type="text"
              value={selectedField.placeholder || ''}
              onChange={e => onUpdateField({ placeholder: e.target.value })}
              placeholder="e.g. Enter text..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Visibility Status</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onUpdateField({ status: 'active' })}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                  currentVisibility === 'show'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateField({ status: 'hide' })}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                  currentVisibility === 'hide'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">Required</span>
              <span className="text-[10px] text-slate-400">Respondent must fill this field</span>
            </div>
            <input
              type="checkbox"
              checked={selectedField.required}
              onChange={e => onUpdateField({ required: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Help Text</label>
            <input
              type="text"
              value={selectedField.help_text || ''}
              onChange={e => onUpdateField({ help_text: e.target.value })}
              placeholder="Short helper note under field..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {isChoiceField && (
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                <span>Options List</span>
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Option</span>
              </button>
            </div>

            <div className="space-y-2">
              {(selectedField.options || []).map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={e => handleUpdateOption(idx, 'label', e.target.value)}
                      placeholder="Option label"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-400 font-mono">Value:</span>
                    <input
                      type="text"
                      value={opt.value}
                      onChange={e => handleUpdateOption(idx, 'value', e.target.value)}
                      className="flex-1 px-2 py-1 rounded-md border border-slate-200 font-mono text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-5 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span>Conditional Logic</span>
            </div>
            <input
              type="checkbox"
              checked={hasConditionalRule}
              onChange={e => handleToggleConditionalDisplay(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Show this field only if another field matches a specific value.
          </p>

          {hasConditionalRule && activeRule && (
            <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block uppercase">
                  Display If Source Field:
                </label>
                <select
                  value={activeRule.source_field_id}
                  onChange={e => {
                    const nextSourceId = e.target.value;
                    const nextSource = form.fields.find(f => String(f.id) === String(nextSourceId));
                    const nextVal = nextSource?.options?.[0]?.value || 'value';
                    handleUpdateRule({
                      source_field_id: nextSourceId,
                      value: nextVal,
                    });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {otherFields.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label} ({f.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block uppercase">
                  Operator:
                </label>
                <select
                  value={activeRule.operator}
                  onChange={e => handleUpdateRule({ operator: e.target.value as RuleOperator })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="less_than">Less Than (&lt;)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block uppercase">
                  Target Value:
                </label>
                {selectedSourceField &&
                selectedSourceField.options &&
                selectedSourceField.options.length > 0 ? (
                  <select
                    value={activeRule.value}
                    onChange={e => handleUpdateRule({ value: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {selectedSourceField.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={activeRule.value}
                    onChange={e => handleUpdateRule({ value: e.target.value })}
                    placeholder="Matching target value"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
