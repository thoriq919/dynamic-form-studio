'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  PlusCircle,
  Database,
  RefreshCw,
  LayoutDashboard,
  CheckCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleResetSeed = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
    } finally {
      setIsSeeding(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Daftar Form', icon: LayoutDashboard },
    { href: '/forms/builder', label: 'Form Builder & Rules', icon: PlusCircle },
    { href: '/forms/submissions', label: 'Hasil Submissions', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              DynamicForm <span className="text-indigo-600 text-xs px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">Engine</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Next.js + Zod + Rule Engine</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSeed}
            disabled={isSeeding}
            title="Reset ulang sample preset forms"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-medium transition"
          >
            {seedSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-bold">Reset!</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">Reset Seed Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
