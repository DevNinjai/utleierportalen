'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PlusCircle, Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, RefreshCw, LayoutDashboard, Receipt, ShieldCheck, History } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState('Kenneth');

  const totalInntekt = 62000;
  const regningspott = 34500;
  const sparing = 8000;
  const variableBrukt = 11050;
  const disponibelt = totalInntekt - regningspott - sparing - variableBrukt;

  const categoryData = [
    { name: 'Mat & Dagligvarer', value: 5400, color: '#f59e0b' },
    { name: 'Transport/Bensin', value: 1800, color: '#06b6d4' },
    { name: 'Fritid/Kafé', value: 2350, color: '#8b5cf6' },
    { name: 'Klær & Utstyr', value: 1500, color: '#ec4899' },
  ];

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    setLoading(true);

    const { error } = await supabase.from('transactions').insert([
      {
        amount: parseFloat(amount),
        description: description,
        date: new Date().toISOString().split('T')[0],
      },
    ]);

    setLoading(false);
    if (error) {
      alert('Feil ved lagring: ' + error.message);
    } else {
      alert('Transaksjon lagret!');
      setAmount('');
      setDescription('');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* HEADER OG TOPPMENY */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg font-black text-xl">B</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Budsy</h1>
            <p className="text-xs text-slate-400">budsy.lundlarsen.no</p>
          </div>
        </div>

        {/* MENYLENKER */}
        <nav className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <Link href="/" className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link href="/incomes" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Inntekter
          </Link>
          <Link href="/fixed-expenses" className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" /> Regningspott
          </Link>
        </nav>

        <div className="flex gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">Kenneth</span>
          <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-medium">Katarina</span>
        </div>
      </header>

      {/* HOVEDTALL / COCKPIT PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>GJENVÆRENDE DISPONIBELT</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-emerald-400 mt-2">
              {disponibelt.toLocaleString('no-NO')} kr
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Netto inntekt
              </span>
              <span className="font-semibold text-slate-200">+{totalInntekt.toLocaleString('no-NO')} kr</span>
            </div>
            <div>
              <span className="text-slate-400 block flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-rose-400" /> Regningspott
              </span>
              <span className="font-semibold text-rose-400">-{regningspott.toLocaleString('no-NO')} kr</span>
            </div>
            <div>
              <span className="text-slate-400 block flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-amber-400" /> Sparing & forbruk
              </span>
              <span className="font-semibold text-amber-400">-{ (sparing + variableBrukt).toLocaleString('no-NO') } kr</span>
            </div>
          </div>
        </div>

        {/* HURTIGSKJEMA */}
        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Hurtigregistrering Kjøp
          </h3>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-2 gap-2 text-xs">
            <input 
              type="number" 
              placeholder="Beløp (kr)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500" 
              required
            />
            <input 
              type="text" 
              placeholder="Beskrivelse" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500" 
              required
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Velg Kategori...</option>
              <option value="Mat">Mat & Dagligvarer</option>
              <option value="Transport">Transport & Bensin</option>
              <option value="Fritid">Fritid & Kafé</option>
            </select>
            <select 
              value={user} 
              onChange={(e) => setUser(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Kenneth">Registrert av: Kenneth</option>
              <option value="Katarina">Registrert av: Katarina</option>
            </select>
            <button 
              type="submit" 
              disabled={loading}
              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lagre Transaksjon'}
            </button>
          </form>
        </div>
      </div>

      {/* GRAFER OG KATEGORIOVERSIKT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">Fordeling av forbruk</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 mb-1">Budsjett vs. Reelt forbruk</h3>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Mat & Dagligvarer</span>
              <span className="text-slate-400">5 400 / 7 000 kr</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '77%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Transport/Bensin</span>
              <span className="text-slate-400">1 800 / 2 500 kr</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Fritid/Kafé</span>
              <span className="text-slate-400">2 350 / 2 000 kr</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
