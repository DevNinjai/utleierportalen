'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, Receipt, PiggyBank, History, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inntekter', href: '/incomes', icon: Wallet },
    { name: 'Regningspott', href: '/fixed-expenses', icon: Receipt },
    { name: 'Sparing', href: '/savings', icon: PiggyBank },
    { name: 'Logg', href: '/transactions', icon: History },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LOGO & TITTEL (ALLTID TIL VENSTRE) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-lg">B</div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">Budsy</h1>
            <span className="text-[10px] text-slate-400">budsy.lundlarsen.no</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGASJON (MIDTSTILT) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0f172a]/60 p-1 rounded-xl border border-slate-800/80 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

{/* BRUKERTAGGER (KLIKKBARE LENKER) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs">
          <Link
            href="/user/Kenneth"
            className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium hover:bg-blue-500/20 transition-colors"
          >
            Kenneth
          </Link>
          <Link
            href="/user/Katarina"
            className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium hover:bg-pink-500/20 transition-colors"
          >
            Katarina
          </Link>
        </div>

        {/* HAMBURGERKNAPP (KUN PA MOBIL) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-[#0f172a] border border-slate-800 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILMENY (NEDTREKK) */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a] p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center px-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Brukere:</span>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">Kenneth</span>
              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-medium">Katarina</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`p-2.5 rounded-lg flex items-center gap-2.5 transition-colors font-medium ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
