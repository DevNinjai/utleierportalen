'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { Receipt, PlusCircle, Trash2, Shield, RefreshCw, LayoutDashboard, Wallet } from 'lucide-react';

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
}

export default function FixedExpensesPage() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [bufferAmount, setBufferAmount] = useState<number>(2000);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Skjemafelt for ny fast utgift
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Hent faste utgifter og buffer fra Supabase
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Hent faste utgifter
    const { data: expData } = await supabase.from('fixed_expenses').select('*');
    if (expData) setExpenses(expData as FixedExpense[]);

    // 2. Hent buffer-innstilling
    const { data: bufData } = await supabase.from('buffer_settings').select('*').limit(1);
    if (bufData && bufData.length > 0) {
      setBufferAmount(bufData[0].monthly_buffer_amount);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lagre ny fast utgift
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setSubmitting(true);
    const { error } = await supabase.from('fixed_expenses').insert([
      { name, amount: parseFloat(amount) }
    ]);

    setSubmitting(false);

    if (error) {
      alert('Feil ved lagring: ' + error.message);
    } else {
      setName('');
      setAmount('');
      fetchData();
    }
  };

  // Slett fast utgift
  const handleDelete = async (id: string) => {
    if (!confirm('Slette denne faste utgiften?')) return;
    const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Oppdater buffer
  const handleUpdateBuffer = async (newAmount: number) => {
    setBufferAmount(newAmount);
    const { data } = await supabase.from('buffer_settings').select('*').limit(1);

    if (data && data.length > 0) {
      await supabase.from('buffer_settings').update({ monthly_buffer_amount: newAmount }).eq('id', data[0].id);
    } else {
      await supabase.from('buffer_settings').insert([{ monthly_buffer_amount: newAmount }]);
    }
  };

  const totalFixed = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRegningspott = totalFixed + bufferAmount;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* HEADER OG NAVIGATION */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            Faste Utgifter & Regningspott
          </h1>
          <p className="text-xs text-slate-400">Beregning av fast månedlig overføring til regningskonto</p>
        </div>

        <nav className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <Link href="/" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link href="/incomes" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Inntekter
          </Link>
          <Link href="/fixed-expenses" className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" /> Regningspott
          </Link>
        </nav>
      </header>

      {/* REGNINGSPOTT - HOVEDSUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-rose-500/30 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              TOTAL REGNINGSPOTT SOM MÅ OVERFØRES (1. I MÅNEDEN)
            </span>
            <div className="text-4xl font-black text-rose-400 mt-2">
              {totalRegningspott.toLocaleString('no-NO')} kr
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Sum faste utgifter</span>
              <span className="font-semibold text-slate-200">{totalFixed.toLocaleString('no-NO')} kr</span>
            </div>
            <div>
              <span className="text-slate-400 block">Sikkerhetsbuffer</span>
              <span className="font-semibold text-amber-400">+{bufferAmount.toLocaleString('no-NO')} kr</span>
            </div>
          </div>
        </div>

        {/* BUFFER PANEL */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <Shield className="w-4 h-4" /> Sikkerhetsbuffer
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Ekstra pott oppå faste utgifter for å dekke uventede svingninger i strøm, kommunale avgifter etc.
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-300 block mb-1">Juster bufferbeløp (kr)</label>
            <input
              type="number"
              value={bufferAmount}
              onChange={(e) => handleUpdateBuffer(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white text-sm focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* SKJEMA OG UTGIFTSLISTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SKJEMA */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Legg til Fast Utgift
          </h3>
          <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Navn på utgift / regning</label>
              <input
                type="text"
                placeholder="f.eks. Husleie, Strøm, Forsikring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Månedlig beløp (kr)</label>
              <input
                type="number"
                placeholder="f.eks. 12500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lagre Utgift'}
            </button>
          </form>
        </div>

        {/* LISTE OVER FASTE UTGIFTER */}
        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Registrerte Faste Utgifter
            </h3>
            <span className="text-xs text-slate-400">{expenses.length} poster</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Laster utgifter...
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              Ingen faste utgifter lagt inn ennå.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-2.5 flex justify-between items-center hover:bg-slate-800/30 px-2 rounded transition-colors">
                  <span className="font-semibold text-slate-100">{exp.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400 text-sm">
                      -{exp.amount.toLocaleString('no-NO')} kr
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Slett"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
