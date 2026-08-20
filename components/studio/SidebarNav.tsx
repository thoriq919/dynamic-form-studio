'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Workflow,
  Database,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  UserCheck,
} from 'lucide-react';
import { User } from '@/types/form';

interface SidebarNavProps {
  currentUser: User | null;
  onLogout: () => void;
  activeNav: 'overview' | 'forms' | 'builder' | 'configurations' | 'users';
  setActiveNav: (nav: 'overview' | 'forms' | 'builder' | 'configurations' | 'users') => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  formsCount: number;
  submissionsCount: number;
  usersCount?: number;
  onNewForm: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentUser,
  onLogout,
  activeNav,
  setActiveNav,
  isNavCollapsed,
  setIsNavCollapsed,
  formsCount,
  submissionsCount,
  usersCount = 0,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside
      className={`${
        isNavCollapsed ? 'w-16 px-2 py-4' : 'w-56 p-4'
      } flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between z-50 shadow-xs transition-all duration-200 relative`}
    >
      <button
        type="button"
        onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-500 z-50 transition-all hover:scale-110 cursor-pointer ring-2 ring-white"
        title={isNavCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
      >
        {isNavCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="space-y-5 flex flex-col items-center flex-1 overflow-y-auto w-full">
        {!isNavCollapsed ? (
          <div className="w-full flex items-center justify-between px-1 flex-shrink-0">
            <div
              onClick={() => setActiveNav(isAdmin ? 'overview' : 'forms')}
              className="flex items-center gap-2.5 cursor-pointer group overflow-hidden"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/30 group-hover:scale-105 transition flex-shrink-0">
                D
              </div>
              <div className="truncate">
                <div className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight truncate">
                  Dynamic Form
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight truncate">
                  Management Studio
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full flex-shrink-0">
            <div
              onClick={() => setActiveNav(isAdmin ? 'overview' : 'forms')}
              className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/30 cursor-pointer hover:scale-105 transition"
              title="Dynamic Form Overview"
            >
              D
            </div>
          </div>
        )}

        <nav className="w-full space-y-1.5 flex-1 flex flex-col items-center">
          {isAdmin ? (
            <>
              {isNavCollapsed ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveNav('overview')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      activeNav === 'overview'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Dashboard Overview"
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('builder')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      activeNav === 'builder'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Form Studio / Visual Builder"
                  >
                    <Workflow className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('forms')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      activeNav === 'forms'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={`All Forms (${formsCount})`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('configurations')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      activeNav === 'configurations'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={`Submissions & Logs (${submissionsCount})`}
                  >
                    <Database className="w-4 h-4 flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('users')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      activeNav === 'users'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={`User Management (${usersCount})`}
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveNav('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeNav === 'overview'
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Dashboard Overview"
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Overview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('builder')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeNav === 'builder'
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Form Studio / Visual Builder"
                  >
                    <Workflow className="w-4 h-4 flex-shrink-0" />
                    <span>Form Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('forms')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeNav === 'forms'
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="All Forms"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">All Forms</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {formsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('configurations')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeNav === 'configurations'
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="Database Submissions & Logs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Database className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Submissions</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {submissionsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('users')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeNav === 'users'
                        ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title="User Management & Impersonation"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Users</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {usersCount}
                    </span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {isNavCollapsed ? (
                <button
                  type="button"
                  onClick={() => setActiveNav('forms')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                    activeNav === 'forms'
                      ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={`Available Forms (${formsCount})`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveNav('forms')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeNav === 'forms'
                      ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title="Available Forms"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Available Forms</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                    {formsCount}
                  </span>
                </button>
              )}
            </>
          )}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 flex-shrink-0 w-full flex flex-col items-center">
        {currentUser && (
          <div className="w-full">
            {!isNavCollapsed ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-800 truncate block">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize block">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title={`Logout (${currentUser.name})`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
