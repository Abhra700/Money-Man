import { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { History as HistoryIcon, Users, CreditCard, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface HistoryProps {
  user: User;
}

export default function History({ user }: HistoryProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'refers' | 'transactions'>('tokens');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const txs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
      setLoading(false);
    };

    fetchHistory();
  }, [user.uid]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">History</h2>
      
      {/* Tabs */}
      <div className="mt-6 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        {[
          { id: 'tokens', label: 'Tokens', icon: HistoryIcon },
          { id: 'refers', label: 'Refers', icon: Users },
          { id: 'transactions', label: 'Payouts', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === tab.id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading history...</div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No history found.</div>
        ) : (
          transactions
            .filter(tx => {
              if (activeTab === 'tokens') return tx.type === 'earn';
              if (activeTab === 'transactions') return tx.type === 'redeem';
              return true; // Refers would be a specific earn type in a real app
            })
            .map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    tx.type === 'earn' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  )}>
                    {tx.type === 'earn' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{tx.description}</p>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar size={12} />
                      <span className="text-[10px] font-medium uppercase">{format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-black",
                  tx.type === 'earn' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount.toLocaleString()}
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
