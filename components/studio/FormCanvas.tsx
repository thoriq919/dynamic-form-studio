'use client';

import React, { useState } from 'react';
import {
  Eye,
  Undo2,
  Redo2,
  Trash2,
  Save,
  CheckCircle2,
  ChevronDown,
  Copy,
  Plus,
  Disc,
} from 'lucide-react';
import { FormConfig, FormField } from '@/types/form';

interface FormCanvasProps {
  form: FormConfig;
  setFormName: (name: string) => void;
  setFormDescription: (desc: string) => void;
  selectedFieldId: number | string;
  onSelectField: (id: number | string) => void;
  onOpenRulesConfig?: (id: number | string) => void;
  onDuplicateField: (id: number | string) => void;
  onDeleteField: (id: number | string) => void;
  onFieldDragStart?: (e: React.DragEvent, id: number | string) => void;
  onSlotDrop: (
    e: React.DragEvent,
    targetParentId: number | string | null,
    targetIndex: number,
    branchConditionValue?: string
  ) => void;
  onInsertComponent: (
    type: any,
    label: string,
    placeholder?: string,
    targetParentId?: number | string | null,
    insertIndex?: number,
    initialConditionValue?: string
  ) => void;
  isDragging: boolean;
  activeDropSlot: string | null;
  setActiveDropSlot: (slot: string | null) => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onRequestDeleteForm: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  setFormName,
  setFormDescription,
  selectedFieldId,
  onSelectField,
  onDuplicateField,
  onDeleteField,
  onSlotDrop,
  onInsertComponent,
  isDragging,
  activeDropSlot,
  setActiveDropSlot,
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRequestDeleteForm,
  onSave,
  isSaving,
  saveSuccess,
}) => {
  const rootFields = form.fields.filter(f => !f.parent_id);

  const getBranchGroupsForRoot = (root: FormField) => {
    const children = form.fields.filter(f => f.parent_id === root.id);
    if (children.length === 0 && (!root.options || root.options.length === 0)) {
      return [];
    }

    const groupsMap = new Map<string, FormField[]>();

    children.forEach(child => {
      const matchRule = child.rules?.find(
        r => String(r.source_field_id) === String(root.id) || r.source_field_id === root.name
      );
      const val = matchRule ? String(matchRule.value) : 'Default';
      if (!groupsMap.has(val)) {
        groupsMap.set(val, []);
      }
      groupsMap.get(val)!.push(child);
    });

    if (groupsMap.size === 0 && root.options && root.options.length > 0) {
      root.options.forEach(opt => {
        groupsMap.set(opt.value, []);
      });
    }

    return Array.from(groupsMap.entries()).map(([conditionVal, items]) => {
      const matchedOpt = root.options?.find(o => o.value.toLowerCase() === conditionVal.toLowerCase());
      const displayLabel = matchedOpt ? matchedOpt.label : conditionVal;
      return {
        conditionVal,
        displayLabel,
        items,
      };
    });
  };

  const getIndexAfterRootTree = (root: FormField) => {
    const findDescendants = (parentId: number | string): FormField[] => {
      const children = form.fields.filter(f => f.parent_id === parentId);
      let all: FormField[] = [];
      for (const child of children) {
        all.push(child);
        all = all.concat(findDescendants(child.id));
      }
      return all;
    };

    const descendants = findDescendants(root.id);
    const lastItem = descendants.length > 0 ? descendants[descendants.length - 1] : root;
    const idx = form.fields.findIndex(f => f.id === lastItem.id);
    return idx >= 0 ? idx + 1 : form.fields.length;
  };

  const renderDropSlot = (
    slotId: string,
    targetParentId: number | string | null,
    targetIndex: number,
    label?: string,
    branchConditionValue?: string
  ) => {
    if (!isDragging) return null;

    const isActive = activeDropSlot === slotId;

    return (
      <div
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
          if (activeDropSlot !== slotId) setActiveDropSlot(slotId);
        }}
        onDragEnter={e => {
          e.preventDefault();
          e.stopPropagation();
          setActiveDropSlot(slotId);
        }}
        onDragLeave={e => {
          e.preventDefault();
          e.stopPropagation();
          if (activeDropSlot === slotId) setActiveDropSlot(null);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          onSlotDrop(e, targetParentId, targetIndex, branchConditionValue);
          setActiveDropSlot(null);
        }}
        className={`w-full transition-all duration-150 flex items-center justify-center cursor-pointer ${
          isActive
            ? 'h-12 my-2 rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-50/95 text-indigo-700 font-bold text-xs shadow-md scale-[1.01]'
            : 'h-2.5 my-0.5 opacity-0 hover:opacity-100 hover:h-8 hover:my-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/20'
        }`}
      >
        {isActive && (
          <span className="flex items-center gap-1.5 pointer-events-none">
            <Plus className="w-3.5 h-3.5 animate-bounce text-indigo-600" />
            <span>{label || 'Drop component here'}</span>
          </span>
        )}
      </div>
    );
  };

  const renderFieldPreviewInput = (field: FormField) => {
    if (field.type === 'free_text') {
      return (
        <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-400 font-medium">
          {field.placeholder || `Enter ${field.label.toLowerCase()}...`}
        </div>
      );
    }

    if (field.type === 'option') {
      return (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {(field.options && field.options.length > 0
            ? field.options
            : [
                { id: 1, label: 'Option 1', value: 'opt_1' },
                { id: 2, label: 'Option 2', value: 'opt_2' },
              ]
          ).map(opt => (
            <div
              key={opt.value}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 font-medium flex items-center gap-1.5"
            >
              <Disc className="w-3.5 h-3.5 text-slate-400" />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700">
        <span>
          {field.options && field.options.length > 0
            ? field.options[0].label
            : 'Select option'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
    );
  };

  return (
    <main
      onDragOver={e => {
        if (isDragging) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto"
    >
      <div className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 gap-4">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={form.name}
            onChange={e => setFormName(e.target.value)}
            className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 -ml-1 w-full truncate"
          />
          <input
            type="text"
            value={form.description || ''}
            onChange={e => setFormDescription(e.target.value)}
            className="text-xs text-slate-400 mt-0.5 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 -ml-1 block w-full max-w-sm truncate"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onRequestDeleteForm}
            className="p-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 shadow-2xs transition"
            title="Delete Form"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition active:scale-[0.98] flex-shrink-0"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-3 flex-1">
        {renderDropSlot('top_root', null, 0, 'Drop at top position')}

        {rootFields.map((root, rIdx) => {
          const isSelected = selectedFieldId === root.id;
          const rootGlobalIndex = form.fields.findIndex(f => f.id === root.id);
          const branchGroups = getBranchGroupsForRoot(root);
          const rootNumber = rIdx + 1;
          const nextRootIndex = getIndexAfterRootTree(root);

          return (
            <React.Fragment key={root.id}>
              <div
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3 relative group/card transition-all"
              >
                <div
                  onClick={() => onSelectField(root.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        {rootNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{root.label}</span>
                      {root.required && <span className="text-rose-500 font-bold text-xs">*</span>}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                        {root.type === 'free_text' ? 'TEXT' : root.type}
                      </span>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onDuplicateField(root.id);
                        }}
                        className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteField(root.id);
                        }}
                        className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>

                  {renderFieldPreviewInput(root)}
                </div>

                {branchGroups.map((branch, bIdx) => (
                  <div key={branch.conditionVal || bIdx} className="relative pl-6 space-y-3 pt-2">
                    <div className="absolute left-2.5 top-0 bottom-6 w-px bg-slate-300" />

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">↳</span>
                        <span className="uppercase tracking-wider">
                          IF "{branch.displayLabel}"
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onInsertComponent(
                            'free_text',
                            'Sub Question',
                            'Enter value...',
                            root.id,
                            undefined,
                            branch.conditionVal
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-700 text-[11px] font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subfield</span>
                      </button>
                    </div>

                    {renderDropSlot(
                      `branch_${root.id}_${branch.conditionVal}_start`,
                      root.id,
                      rootGlobalIndex + 1,
                      `Drop at start of branch (${branch.displayLabel})`,
                      branch.conditionVal
                    )}

                    {branch.items.map((child, cIdx) => {
                      const isChildSelected = selectedFieldId === child.id;
                      const hasLogic = child.rules && child.rules.length > 0;
                      const childGlobalIndex = form.fields.findIndex(f => f.id === child.id);
                      const childNumber = `${rootNumber}.${cIdx + 1}`;

                      return (
                        <React.Fragment key={child.id}>
                          <div
                            onClick={() => onSelectField(child.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative bg-white ${
                              isChildSelected
                                ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex-shrink-0">
                                  {childNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{child.label}</span>
                                {child.required && (
                                  <span className="text-rose-500 font-bold text-xs">*</span>
                                )}
                                {hasLogic && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-600">
                                    LOGIC
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                                  {child.type === 'free_text' ? 'TEXT' : child.type}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-slate-400">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onDuplicateField(child.id);
                                  }}
                                  className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onDeleteField(child.id);
                                  }}
                                  className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              </div>
                            </div>

                            {renderFieldPreviewInput(child)}
                          </div>

                          {renderDropSlot(
                            `branch_${root.id}_after_${child.id}`,
                            root.id,
                            childGlobalIndex + 1,
                            `Drop at this position (${branch.displayLabel})`,
                            branch.conditionVal
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>

              {renderDropSlot(
                `between_roots_${root.id}`,
                null,
                nextRootIndex,
                `Drop between Main Field #${rootNumber} and #${rootNumber + 1}`
              )}
            </React.Fragment>
          );
        })}

        <button
          type="button"
          onClick={() =>
            onInsertComponent('free_text', 'New Field', 'Enter text...', null, form.fields.length)
          }
          className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-400 hover:text-indigo-600 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </button>
      </div>
    </main>
  );
};
