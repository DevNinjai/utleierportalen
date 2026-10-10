'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { History, Search, Filter, Trash2, RefreshCw, PlusCircle, Calendar, Download, User } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category_id?: string;
  user_id?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  budget_limit: number;
}

interface UserProfile {
  id: string;
  name: string;
  color_code: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');

  const fetchData = async () => {
    setLoading(true);

    // Hent kategorier
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData) setCategories(catData as Category[]);

    // Hent brukere
    const { data: userData } = await supabase.from('users').select('*');
    if (userData) setUsers(userData as UserProfile[]);

    // Hent innlogget bruker fra auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();
      if (dbUser) setCurrentUser(dbUser as UserProfile);
    }

    // Hent transaksjoner
    const { data: txData, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && txData) {
      setTransactions(txData as Transaction[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setSubmitting(true);

    const { error } = await supabase.from('transactions').insert([
      {
        amount: parseFloat(amount),
        description,
        date,
        category_id: categoryId || null,
        user_id: currentUser ? currentUser.id : null, // Automatisk kobling til innlogget bruker!
      },
    ]);

    setSubmitting(false);

    if (error) {
      alert('Feil ved lagring: ' + error.message);
    } else {
      setAmount('');
      setDescription('');
      setCategoryId('');
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Vil du slette denne transaksjonen?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) fetchData();
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || tx.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Ingen transaksjoner å eksportere.');
      return;
    }

    const headers = ['Dato', 'Beskrivelse', 'Belop', 'Kategori', 'Registrert_Av'];
    const rows = filteredTransactions.map((tx) => {
      const category = categories.find((c) => c.id === tx.category_id);
      const txUser = users.find((u) => u.id === tx.user_id);
      return [
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        `"${category ? category.name : 'Generelt'}"`,
        `"${txUser ? txUser.name : 'Ukjent'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `budsy-transaksjoner-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Transaksjonslogg & Forbruk
          </h1>
          <p className="text-xs text-slate-400">Oversikt og historikk over alle variable kjøp</p>
        </div>

        {currentUser && (
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
            Registrerer som: <strong className="text-emerald-400">{currentUser.name}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SKJEMA */}
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Registrer Ny Utgift
          </h3>

          <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Beskrivelse / Hva ble kjøpt?</label>
              <input
                type="text"
                placeholder="f.eks. Rema 1000, Bensin, Kafé"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Beløp (kr)</label>
                <input
                  type="number"
                  placeholder="f.eks. 450"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dato</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Ingen valgt / Generelt</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lagre Transaksjon'}
            </button>
          </form>
        </div>

        {/* TRANSAKSJONSTABELL */}
        <div className="md:col-span-2 bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Søk i transaksjoner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 pl-8 pr-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 p-1.5 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Alle kategorier</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 px-1">
            <span>Viser {filteredTransactions.length} transaksjoner</span>
            <div className="flex items-center gap-3">
              <span>
                Sum: <strong className="text-amber-400">{totalFilteredAmount.toLocaleString('no-NO')} kr</strong>
              </span>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Eksporter CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Laster historikk...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              Ingen transaksjoner funnet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.map((tx) => {
                const category = categories.find((c) => c.id === tx.category_id);
                const txUser = users.find((u) => u.id === tx.user_id);

                return (
                  <div
                    key={tx.id}
                    className="py-2.5 flex justify-between items-center hover:bg-slate-800/30 px-2 rounded transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{tx.description}</span>
                        {category && (
                          <span
                            className="px-2 py-0.5 text-[10px] rounded-full border font-medium"
                            style={{
                              backgroundColor: `${category.color}20`,
                              borderColor: `${category.color}40`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                        {txUser && (
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-full font-semibold border ${
                              txUser.name === 'Kenneth'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                            }`}
                          >
                            {txUser.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {tx.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400 text-sm">
                        -{tx.amount.toLocaleString('no-NO')} kr
                      </span>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Slett transaksjon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
