'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { LayoutDashboard, Wallet, Receipt, PiggyBank, History, Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Skjul Navbar dersom vi står på login-siden
  if (pathname === '/login') return null;

  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        if (dbUser) setActiveUser(dbUser);
      } else {
        setActiveUser(null);
      }
    };

    fetchAuthUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAuthUser();
      } else {
        setActiveUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveUser(null);
    router.push('/login');
    router.refresh();
  };

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
        
        {/* LOGO & TITTEL */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-lg">B</div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">Budsy</h1>
            <span className="text-[10px] text-slate-400">budsy.lundlarsen.no</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGASJON */}
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

        {/* BRUKERPROFIL & LOGG UT (DESKTOP) */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {activeUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${activeUser.name}`}
                className={`px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 transition-colors ${
                  activeUser.name === 'Kenneth'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                    : 'bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{activeUser.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Logg ut"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors"
            >
              Logg inn
            </Link>
          )}
        </div>

        {/* HAMBURGERKNAPP (MOBIL) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-[#0f172a] border border-slate-800 focus:outline-none"
        >
          {isOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILMENY */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a] p-3 space-y-2 text-xs">
          {activeUser && (
            <div className="flex justify-between items-center px-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Innlogget som:</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/user/${activeUser.name}`}
                  onClick={() => setIsOpen(false)}
                  className={`px-2.5 py-0.5 rounded font-medium ${
                    activeUser.name === 'Kenneth' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                  }`}
                >
                  {activeUser.name}
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="text-rose-400 font-semibold underline ml-1"
                >
                  Logg ut
                </button>
              </div>
            </div>
          )}

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
