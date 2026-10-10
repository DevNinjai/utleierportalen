'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { ArrowUpRight, ArrowDownRight, RefreshCw, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const checkUserAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        setLoading(true);

        // Hent transaksjoner
        const { data: txData } = await supabase.from('transactions').select('*');
        if (txData) setTransactions(txData as Transaction[]);

        // Hent kategorier
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData) setCategories(catData as Category[]);

        // Hent inntekter
        const { data: incData } = await supabase.from('incomes').select('*');
        if (incData) {
          const sumInc = incData.reduce((acc, curr) => acc + (curr.net_amount || 0), 0);
          setTotalIncome(sumInc);
        }

        // Hent faste utgifter
        const { data: expData } = await supabase.from('fixed_expenses').select('*');
        if (expData) {
          const sumExp = expData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          setTotalFixed(sumExp);
        }
      } catch (err) {
        console.error('Feil under henting av data:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-400" /> Laster dashboard...
      </div>
    );
  }

  const totalSpent = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const remainingBudget = totalIncome - totalFixed - totalSpent;

  // Grupper utgifter per kategori for kakediagrammet
  const chartData = categories.map((cat) => {
    const value = transactions
      .filter((t) => t.category_id === cat.id)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return { name: cat.name, value, color: cat.color || '#10b981' };
  }).filter((item) => item.value > 0);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* NØKKELTALL PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase font-medium">Disponibelt beløp</span>
          <div className={`text-3xl font-black ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {remainingBudget.toLocaleString('no-NO')} kr
          </div>
          <span className="text-[11px] text-slate-500">Gjenværende etter faste utgifter & variable utgifter</span>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-emerald-400 uppercase font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Nettoinntekt
          </span>
          <div className="text-2xl font-bold text-slate-100">
            +{totalIncome.toLocaleString('no-NO')} kr
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-amber-400 uppercase font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Faste & Variable Utgifter
          </span>
          <div className="text-2xl font-bold text-slate-100">
            -{(totalFixed + totalSpent).toLocaleString('no-NO')} kr
          </div>
        </div>
      </div>

      {/* KAKEDIAGRAM SIKRET FOR HYDRATION */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-emerald-400" /> Forbruk Per Kategori
        </h3>

        {chartData.length === 0 ? (
          <div className="text-center p-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
            Ingen variable transaksjoner registrert ennå denne måneden.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('no-NO')} kr`, 'Forbruk']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
