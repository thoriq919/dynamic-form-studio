'use client';

import React from 'react';
import {
  Plus,
  LayoutGrid,
  Database,
  FileText,
  Users,
} from 'lucide-react';
import { FormConfig, FormSubmission, User } from '@/types/form';

interface DashboardOverviewProps {
  currentUser: User;
  forms: FormConfig[];
  submissions: FormSubmission[];
  onCreateNewForm: () => void;
  onEditForm: (form: FormConfig) => void;
  onPreviewForm: (form: FormConfig) => void;
  onViewAllForms: () => void;
  onViewUsers: () => void;
  onViewSubmissions: () => void;
  onViewSubmissionDetail?: (sub: FormSubmission) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  forms,
  submissions,
  onCreateNewForm,
  onEditForm,
  onPreviewForm,
  onViewAllForms,
  onViewUsers,
  onViewSubmissions,
  onViewSubmissionDetail,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.status !== 'draft').length;
  const draftForms = forms.filter(f => f.status === 'draft').length;
  const recentlyUpdated = forms.filter(f => {
    if (!f.updated_at && !f.created_at) return false;
    const time = new Date(f.updated_at || f.created_at || '').getTime();
    return Date.now() - time < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const recentForms = forms.slice(0, 5);

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const mockActivities = [
    ...(forms.slice(0, 2).map((f, i) => ({
      id: `form_${f.id}`,
      title: `${f.name} updated`,
      time: getRelativeTime(f.updated_at || f.created_at),
      color: i === 0 ? 'bg-indigo-600' : 'bg-slate-400',
      onClick: () => onEditForm(f),
    }))),
    ...(submissions.slice(0, 4).map((s) => ({
      id: `sub_${s.id}`,
      title: `Response submitted on ${s.form_name || 'Form'}`,
      time: getRelativeTime(s.created_at),
      color: 'bg-emerald-500',
      onClick: () => onViewSubmissionDetail ? onViewSubmissionDetail(s) : onViewSubmissions(),
    }))),
  ];

  const activities = mockActivities.length > 0 ? mockActivities : [
    { id: '1', title: 'System initialized and ready', time: 'Just now', color: 'bg-indigo-600', onClick: undefined },
    { id: '2', title: 'Administrator workspace active', time: 'Today', color: 'bg-emerald-500', onClick: undefined },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto p-8 space-y-6 animate-fadeIn select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {currentUser.name.split(' ')[0] || currentUser.username}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your forms and configurations from one workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewForm}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Form</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL FORMS
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{totalForms}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            ACTIVE FORMS
          </span>
          <div className="text-2xl font-extrabold text-indigo-600">{activeForms}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            DRAFT FORMS
          </span>
          <div className="text-2xl font-extrabold text-slate-700">{draftForms}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            RECENTLY UPDATED
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{recentlyUpdated}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Forms</h3>
            <button
              type="button"
              onClick={onViewAllForms}
              className="px-3 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Form Name</th>
                  <th className="pb-3 font-medium">Fields</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Updated</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentForms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No forms created yet. Click <span className="font-bold text-indigo-600">"+ Create Form"</span> above to get started.
                    </td>
                  </tr>
                ) : (
                  recentForms.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition group">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition flex-shrink-0" />
                          <span className="font-bold text-slate-900">{f.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {f.fields?.length || 0} fields
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            f.status === 'draft'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {f.status === 'draft' ? 'Draft' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {getRelativeTime(f.updated_at || f.created_at)}
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditForm(f)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-[11px] font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewForm(f)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold transition"
                          >
                            Fill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
              <button
                type="button"
                onClick={onCreateNewForm}
                className="bg-white p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  Create Form
                </span>
              </button>

              <button
                type="button"
                onClick={onViewAllForms}
                className="bg-white p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  Manage Forms
                </span>
              </button>

              <button
                type="button"
                onClick={onViewUsers}
                className="bg-white p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  Manage Users
                </span>
              </button>

              <button
                type="button"
                onClick={onViewSubmissions}
                className="bg-white p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  Submissions Log
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Recent Activity
            </h3>

            <div className="relative pl-6 space-y-5">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />

              {activities.map(act => (
                <div
                  key={act.id}
                  onClick={act.onClick}
                  className={`relative flex items-start gap-3 text-xs ${
                    act.onClick ? 'cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-xl transition' : ''
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${act.color} ring-4 ring-white absolute -left-6 top-1.5`}
                  />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate hover:text-indigo-600 transition">
                      {act.title}
                    </p>
                    <span className="text-[11px] text-slate-400 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
