import { useState, useEffect } from 'react';
import { User, WithdrawalRequest } from '../types';
import { Users, CreditCard, Check, X, Search, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface AdminProps {
  user: User;
}

export default function Admin({ user }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'withdrawals') {
      const unsub = onSnapshot(
        query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest)));
          setLoading(false);
        }
      );
      return () => unsub();
    } else {
      const unsub = onSnapshot(
        query(collection(db, 'users'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          setUsers(snapshot.docs.map(doc => doc.data() as User));
          setLoading(false);
        }
      );
      return () => unsub();
    }
  }, [activeTab]);

  const handleAction = async (withdrawal: WithdrawalRequest, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), {
        status,
        updatedAt: new Date().toISOString(),
        adminNote: `Processed by ${user.displayName}`
      });
      alert(`Withdrawal ${status}!`);
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-red-600 dark:text-red-400" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Admin Panel</h2>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'withdrawals' ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <CreditCard size={16} />
          Withdrawals
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'users' ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <Users size={16} />
          Users
        </button>
      </div>

      {/* List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading admin data...</div>
        ) : activeTab === 'withdrawals' ? (
          withdrawals.length === 0 ? (
            <div className="py-10 text-center text-slate-400">No withdrawal requests.</div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{w.rewardType}</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">₹{w.amount}</h4>
                  </div>
                  <div className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                    w.status === 'pending' ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" :
                    w.status === 'approved' ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  )}>
                    {w.status}
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{w.userEmail}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{format(new Date(w.createdAt), 'MMM dd, yyyy • HH:mm')}</p>
                </div>
                {w.status === 'pending' && (
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => handleAction(w, 'approved')}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-bold text-white transition-all hover:bg-green-700 active:scale-95"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(w, 'rejected')}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          users.map((u) => (
            <div key={u.uid} className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{u.displayName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{u.tokens.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{u.role}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
