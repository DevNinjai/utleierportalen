'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { User, Wallet, Receipt, Shield, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Income {
  id: string;
  net_amount: number;
  owner: 'Kenneth' | 'Katarina' | 'Felles';
}

interface FixedExpense {
  id: string;
  amount: number;
}

export default function UserDashboardPage() {
  const params = useParams();
  const userName = (params.name as string) || 'Kenneth';

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [bufferAmount, setBufferAmount] = useState<number>(2000);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);

    // 1. Hent inntekter
    const { data: incData } = await supabase.from('incomes').select('*');
    if (incData) setIncomes(incData as Income[]);

    // 2. Hent faste utgifter
    const { data: expData } = await supabase.from('fixed_expenses').select('*');
    if (expData) setFixedExpenses(expData as FixedExpense[]);

    // 3. Hent buffer
    const { data: bufData } = await supabase.from('buffer_settings').select('*').limit(1);
    if (bufData && bufData.length > 0) {
      setBufferAmount(bufData[0].monthly_buffer_amount);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userName]);

  // BEREGNINGER FOR SPESIFIKK BRUKER
  const egenInntekt = incomes
    .filter((i) => i.owner.toLowerCase() === userName.toLowerCase())
    .reduce((acc, curr) => acc + curr.net_amount, 0);

  const fellesInntekt = incomes
    .filter((i) => i.owner === 'Felles')
    .reduce((acc, curr) => acc + curr.net_amount, 0);

  const halvFellesInntekt = fellesInntekt / 2;
  const totalPersonligInntekt = egenInntekt + halvFellesInntekt;

  // Faste utgifter og regningspott (del regningspott + buffer i to)
  const totaltFasteUtgifter = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRegningspottInklBuffer = totaltFasteUtgifter + bufferAmount;
  const minAndelRegningspott = totalRegningspottInklBuffer / 2;

  // Personlig disponibelt etter regningspott
  const personligNettoGjenstaende = totalPersonligInntekt - minAndelRegningspott;

  const isKenneth = userName.toLowerCase() === 'kenneth';

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* HEADER */}
      <header className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className={`w-5 h-5 ${isKenneth ? 'text-blue-400' : 'text-pink-400'}`} />
            Personlig Dashboard: <span className={isKenneth ? 'text-blue-400' : 'text-pink-400'}>{userName}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Individuell beregning av nettoinntekt og din halvpart av regningspotten
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            isKenneth
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
          }`}
        >
          {userName}
        </span>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Laster bruker-dashboard...
        </div>
      ) : (
        <>
          {/* HOVEDPANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-xs text-slate-400 uppercase font-medium">Din Totale Inntekt</span>
              <div className="text-3xl font-black text-emerald-400">
                +{totalPersonligInntekt.toLocaleString('no-NO')} kr
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span>Egen nettoinntekt:</span>
                  <span className="font-semibold text-slate-200">{egenInntekt.toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Andel fellesinntekt (50%):</span>
                  <span className="font-semibold text-slate-200">+{halvFellesInntekt.toLocaleString('no-NO')} kr</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-xs text-slate-400 uppercase font-medium">Din Andel av Regningspotten (50%)</span>
              <div className="text-3xl font-black text-rose-400">
                -{minAndelRegningspott.toLocaleString('no-NO')} kr
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span>Andel faste utgifter (50%):</span>
                  <span className="font-semibold text-slate-200">{(totaltFasteUtgifter / 2).toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Andel buffer (50%):</span>
                  <span className="font-semibold text-amber-400">+{(bufferAmount / 2).toLocaleString('no-NO')} kr</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-xs text-slate-400 uppercase font-medium">Ditt Overskudd / Disponibelt</span>
              <div
                className={`text-3xl font-black ${
                  personligNettoGjenstaende >= 0 ? 'text-emerald-400' : 'text-rose-500'
                }`}
              >
                {personligNettoGjenstaende.toLocaleString('no-NO')} kr
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Netto til overs etter at din halvpart av faste utgifter og buffer er dekket.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
