'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { PiggyBank, PlusCircle, Trash2, RefreshCw, LayoutDashboard, Wallet, Receipt, Target, ArrowUpRight } from 'lucide-react';

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
  monthly_contribution: number;
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Skjemafelt for nytt sparemål
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [color, setColor] = useState('#10b981');

  // Hent sparemål fra Supabase
  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('savings_goals').select('*');
    if (error) {
      console.error('Feil ved henting av sparemål:', error.message);
    } else if (data) {
      setGoals(data as SavingsGoal[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Lagre nytt sparemål
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    setSubmitting(true);
    const { error } = await supabase.from('savings_goals').insert([
      {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        color,
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert('Feil ved lagring: ' + error.message);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setMonthlyContribution('');
      fetchGoals();
    }
  };

  // Slett sparemål
  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette sparemålet?')) return;
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (!error) fetchGoals();
  };

  // Oppdater saldometer for et mål
  const handleUpdateSaldo = async (id: string, newSaldo: number) => {
    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: newSaldo })
      .eq('id', id);

    if (!error) fetchGoals();
  };

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current_amount, 0);
  const totalMonthlySavings = goals.reduce((acc, curr) => acc + curr.monthly_contribution, 0);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* HEADER OG TOPPMENY */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-400" />
            Sparemål & Faste Avtaler
          </h1>
          <p className="text-xs text-slate-400">Oversikt over oppsparte midler og månedlige spareavtaler</p>
        </div>

        <nav className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <Link href="/" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link href="/incomes" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Inntekter
          </Link>
          <Link href="/fixed-expenses" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" /> Regningspott
          </Link>
          <Link href="/savings" className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
            <PiggyBank className="w-3.5 h-3.5" /> Sparing
          </Link>
        </nav>
      </header>

      {/* NØKKELTALL FOR SPARING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-medium">Totalt Oppspart Saldo</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {totalSaved.toLocaleString('no-NO')} kr
          </div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-medium">Månedlig Planlagt Sparing</span>
          <div className="text-3xl font-black text-amber-400 mt-1">
            {totalMonthlySavings.toLocaleString('no-NO')} kr / mnd
          </div>
        </div>
      </div>

      {/* SKJEMA OG SPAREMÅL-KORT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* REGISTRERINGSSKJEMA */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Opprett Nytt Sparemål
          </h3>

          <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Navn på sparemål</label>
              <input
                type="text"
                placeholder="f.eks. Ferie 2026, Ny Bil, Buffer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Målbeløp (kr)</label>
                <input
                  type="number"
                  placeholder="f.eks. 50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Startsaldo (kr)</label>
                <input
                  type="number"
                  placeholder="f.eks. 10000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Mnd. avtale (kr)</label>
                <input
                  type="number"
                  placeholder="f.eks. 2000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Kortfarge</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 bg-[#0f172a] border border-slate-700 rounded p-1 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lagre Sparemål'}
            </button>
          </form>
        </div>

        {/* LISTE OVER SPAREMÅL-KORT */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Aktive Sparemål ({goals.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Laster sparemål...
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              Ingen sparemål registrert ennå.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.map((goal) => {
                const percentage = Math.min(
                  Math.round((goal.current_amount / goal.target_amount) * 100),
                  100
                );

                return (
                  <div
                    key={goal.id}
                    className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    {/* FARGETAG-STREK ØVERST */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: goal.color }}
                    ></div>

                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-slate-400" />
                          {goal.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Fast trekk: <strong className="text-amber-400">{goal.monthly_contribution.toLocaleString('no-NO')} kr/mnd</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Slett"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">
                          {goal.current_amount.toLocaleString('no-NO')} kr
                        </span>
                        <span className="text-slate-400">
                          Mål: {goal.target_amount.toLocaleString('no-NO')} kr ({percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: goal.color,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* HURTIG-JUSTERING AV SALDO */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Oppdater saldo:</span>
                      <input
                        type="number"
                        defaultValue={goal.current_amount}
                        onBlur={(e) => handleUpdateSaldo(goal.id, parseFloat(e.target.value) || 0)}
                        className="bg-[#0f172a] border border-slate-700 px-2 py-1 rounded text-white text-right w-28 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
