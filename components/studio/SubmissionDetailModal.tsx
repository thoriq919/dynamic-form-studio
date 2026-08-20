'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  Layers,
  ChevronRight,
  Shield,
  UserCheck,
  Sparkles,
  Database,
} from 'lucide-react';
import { FormConfig, FormField, FormSubmission } from '@/types/form';
import { flattenFieldTree } from '@/lib/rules';

interface SubmissionDetailModalProps {
  submission: FormSubmission | null;
  forms: FormConfig[];
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  forms,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'form' | 'json'>('form');

  if (!submission) return null;

  const matchingForm = forms.find(
    f => String(f.id) === String(submission.form_id) || f.name === submission.form_name
  );

  const flatFields: FormField[] = matchingForm
    ? flattenFieldTree(matchingForm.fields || [])
    : [];

  const fieldMap = new Map<string, FormField>();
  flatFields.forEach(f => {
    fieldMap.set(f.name, f);
    fieldMap.set(String(f.id), f);
  });

  const getFieldInfo = (key: string) => {
    const field = fieldMap.get(key);
    if (!field) {
      return {
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        type: 'Free Text',
        required: false,
        displayValue: submission.data[key],
      };
    }

    let displayValue = submission.data[key];
    if (field.options && field.options.length > 0) {
      const matchedOpt = field.options.find(
        o => String(o.value).toLowerCase() === String(displayValue).toLowerCase()
      );
      if (matchedOpt) {
        displayValue = matchedOpt.label;
      }
    }

    let typeLabel = 'Free Text';
    if (field.type === 'select') typeLabel = 'Select / Dropdown';
    if (field.type === 'option') typeLabel = 'Option / Radio';

    return {
      label: field.label || key,
      type: typeLabel,
      required: Boolean(field.required),
      displayValue: displayValue !== undefined && displayValue !== null && displayValue !== '' ? displayValue : '-',
    };
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(submission.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const entries = Object.entries(submission.data || {});

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0 mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Submission #{submission.id}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Validated
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1 truncate">
                {submission.form_name || matchingForm?.name || `Form #${submission.form_id}`}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(submission.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {submission.user_name && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Oleh: <strong className="text-slate-700">{submission.user_name}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition flex-shrink-0 shadow-2xs border border-transparent hover:border-slate-200"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View switcher tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveViewTab('form')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'form'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Jawaban Formulir ({entries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('json')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeViewTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Raw JSON Data</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Salin JSON"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Data</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
          {activeViewTab === 'form' ? (
            <div className="space-y-3">
              {entries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Tidak ada data jawaban yang tersimpan.
                </div>
              ) : (
                entries.map(([key, val], idx) => {
                  const info = getFieldInfo(key);
                  const isTextLong = String(info.displayValue).length > 40;

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            {info.label}
                          </span>
                          {info.required && (
                            <span className="text-rose-500 text-xs font-bold" title="Field Wajib">
                              *
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 font-mono">
                          {info.type}
                        </span>
                      </div>

                      <div className="pl-7">
                        {isTextLong ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                            {String(info.displayValue)}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-xs font-bold text-indigo-900 break-words">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                            <span>{String(info.displayValue)}</span>
                          </div>
                        )}
                        <span className="block text-[10px] text-slate-400 font-mono mt-1">
                          key: {key}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{JSON.stringify(submission.data, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total {entries.length} field terisi & tervalidasi
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
};
