'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Mail, LogIn, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Logg inn hos Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setLoading(false);
        setErrorMsg('Feil e-post eller passord: ' + error.message);
        return;
      }

      if (data?.session) {
        // 2. Vellykket innlogging - tving full omlasting til forsiden
        window.location.assign('/');
      } else {
        setLoading(false);
        setErrorMsg('Kunne ikke hente brukerøkten. Prøv igjen.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Det oppstod en uventet feil: ' + (err?.message || err));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 w-full max-w-md space-y-4 shadow-xl">
        <div className="text-center space-y-1">
          <div className="bg-emerald-500 text-slate-950 w-12 h-12 rounded-xl font-black text-2xl flex items-center justify-center mx-auto mb-2">
            B
          </div>
          <h2 className="text-xl font-bold text-white">Logg inn på Budsy</h2>
          <p className="text-xs text-slate-400">Tast inn e-post og passord for å få tilgang</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">E-postadresse</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="f.eks. kenneth@lundlarsen.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Passord</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm mt-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Logger inn...' : 'Logg Inn'}
          </button>
        </form>
      </div>
    </div>
  );
}
