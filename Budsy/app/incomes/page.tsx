'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Wallet, Calendar, User, ArrowUpRight, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Income {
  id: string;
  description: string;
  net_amount: number;
  date: string;
  owner: 'Kenneth' | 'Katarina' | 'Felles';
  is_recurring: boolean;
}

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Skjemafelt
  const [description, setDescription] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [owner, setOwner] = useState<'Kenneth' | 'Katarina' | 'Felles'>('Kenneth');
  const [isRecurring, setIsRecurring] = useState(false);

  // Hent inntekter fra Supabase
  const fetchIncomes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Feil ved henting av inntekter:', error.message);
    } else if (data) {
      setIncomes(data as Income[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Legg til ny inntekt
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !netAmount) return;

    setSubmitting(true);
    const { error } = await supabase.from('incomes').insert([
      {
        description,
        net_amount: parseFloat(netAmount),
        date,
        owner,
        is_recurring: isRecurring,
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert('Kunne ikke lagre inntekt: ' + error.message);
    } else {
      setDescription('');
      setNetAmount('');
      setIsRecurring(false);
      fetchIncomes();
    }
  };

  // Slett inntekt
  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne inntektsføringen?')) return;

    const { error } = await supabase.from('incomes').delete().eq('id', id);

    if (error) {
      alert('Feil ved sletting: ' + error.message);
    } else {
      fetchIncomes();
    }
  };

  // Beregn summer per eier
  const totalKenneth = incomes.filter(i => i.owner === 'Kenneth').reduce((acc, curr) => acc + curr.net_amount, 0);
  const totalKatarina = incomes.filter(i => i.owner === 'Katarina').reduce((acc, curr) => acc + curr.net_amount, 0);
  const totalFelles = incomes.filter(i => i.owner === 'Felles').reduce((acc, curr) => acc + curr.net_amount, 0);
  const totalNetto = totalKenneth + totalKatarina + totalFelles;

  // Hjelpefunksjon for fargekoding av eier
  const getOwnerBadge = (owner: 'Kenneth' | 'Katarina' | 'Felles') => {
    switch (owner) {
      case 'Kenneth':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">Kenneth</span>;
      case 'Katarina':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-medium">Katarina</span>;
      case 'Felles':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">Felles</span>;
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Inntekter (Netto utbetalt)
          </h1>
          <p className="text-xs text-slate-400">Registrering av fast, variabel og felles nettoinntekt</p>
        </div>
      </header>

      {/* SUMMERINGS-PANELER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1e293b] p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-medium">Totalt Netto</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totalNetto.toLocaleString('no-NO')} kr
          </div>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-blue-400 uppercase font-medium">Kenneth</span>
          <div className="text-xl font-bold text-slate-200 mt-1">
            {totalKenneth.toLocaleString('no-NO')} kr
          </div>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-pink-400 uppercase font-medium">Katarina</span>
          <div className="text-xl font-bold text-slate-200 mt-1">
            {totalKatarina.toLocaleString('no-NO')} kr
          </div>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-emerald-400 uppercase font-medium">Felles</span>
          <div className="text-xl font-bold text-slate-200 mt-1">
            {totalFelles.toLocaleString('no-NO')} kr
          </div>
        </div>
      </div>

      {/* REGISTRERINGSSKJEMA OG TRANSAKSJONSLISTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SKJEMA FOR REGISTRERING */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Ny Inntektsføring
          </h3>

          <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Beskrivelse / Kilde</label>
              <input
                type="text"
                placeholder="f.eks. Månedslønn, Overtid, Leieinntekt"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Netto utbetalt beløp (kr)</label>
              <input
                type="number"
                placeholder="f.eks. 35000"
                value={netAmount}
                onChange={(e) => setNetAmount(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Dato utbetalt</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mottaker / Eier</label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value as 'Kenneth' | 'Katarina' | 'Felles')}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Kenneth">Kenneth</option>
                  <option value="Katarina">Katarina</option>
                  <option value="Felles">Felles</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded bg-[#0f172a] border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="isRecurring" className="text-slate-300 cursor-pointer">
                Fast månedlig inntekt (mal)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 text-xs"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lagre Inntekt'}
            </button>
          </form>
        </div>

        {/* LISTE OVER REGISTRERTE INNTEKTER */}
        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Registrerte Inntekter
            </h3>
            <span className="text-xs text-slate-400">{incomes.length} føringer</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Laster inntekter...
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              Ingen inntekter registrert ennå.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {incomes.map((inc) => (
                <div key={inc.id} className="py-2.5 flex justify-between items-center hover:bg-slate-800/30 px-2 rounded transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{inc.description}</span>
                      {getOwnerBadge(inc.owner)}
                      {inc.is_recurring && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                          Fast
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {inc.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400 text-sm">
                      +{inc.net_amount.toLocaleString('no-NO')} kr
                    </span>
                    <button
                      onClick={() => handleDeleteIncome(inc.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Slett føring"
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
