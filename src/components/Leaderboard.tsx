import { useState, useEffect } from 'react';
import { User } from '../types';
import { Trophy, Medal, Users, ClipboardCheck, Timer, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { OperationType, handleFirestoreError } from '../App';

interface LeaderboardProps {
  user: User;
}

export default function Leaderboard({ user }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'refers' | 'tasks'>('tasks');
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // In a real app, you'd have a 'referralCount' or 'tasksCompleted' field
        // For now, we'll just sort by tokens as a proxy
        const q = query(collection(db, 'users'), orderBy('tokens', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as User);
        setTopUsers(users);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Leaderboard</h2>
      
      {/* Tabs */}
      <div className="mt-6 flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        <button
          onClick={() => setActiveTab('refers')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'refers' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <Users size={16} />
          Refers
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'tasks' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <ClipboardCheck size={16} />
          Tasks
        </button>
      </div>

      {/* Contest Info */}
      <div className="mt-8 rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Daily Contest</p>
            <h3 className="text-xl font-black uppercase tracking-tighter">Prize Pool: 5,000</h3>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Timer size={16} />
            <span className="text-sm font-bold">14:22:05</span>
          </div>
        </div>
      </div>

      {/* Top 3 */}
      <div className="mt-16 flex items-end justify-center gap-4 px-4">
        {topUsers.length >= 2 && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className={cn(
                "h-16 w-16 overflow-hidden rounded-full border-4 bg-white dark:bg-slate-800 transition-all",
                topUsers[1].uid === user.uid ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-slate-300 dark:border-slate-600"
              )}>
                <img src={topUsers[1].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topUsers[1].uid}`} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-slate-400">
                <Medal size={20} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-300 dark:bg-slate-600 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:text-slate-200 shadow-sm">#2</div>
            </div>
            <p className={cn(
              "max-w-[80px] truncate text-xs font-bold",
              topUsers[1].uid === user.uid ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
            )}>{topUsers[1].displayName}</p>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{topUsers[1].tokens.toLocaleString()}</p>
          </div>
        )}

        {topUsers.length >= 1 && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className={cn(
                "h-24 w-24 overflow-hidden rounded-full border-4 bg-white dark:bg-slate-800 shadow-lg transition-all",
                topUsers[0].uid === user.uid ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-yellow-400 shadow-yellow-100 dark:shadow-none"
              )}>
                <img src={topUsers[0].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topUsers[0].uid}`} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-md">
                <Crown size={36} fill="currentColor" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-white shadow-md">#1</div>
            </div>
            <p className={cn(
              "max-w-[100px] truncate font-bold",
              topUsers[0].uid === user.uid ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-100"
            )}>{topUsers[0].displayName}</p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{topUsers[0].tokens.toLocaleString()}</p>
          </div>
        )}

        {topUsers.length >= 3 && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className={cn(
                "h-16 w-16 overflow-hidden rounded-full border-4 bg-white dark:bg-slate-800 transition-all",
                topUsers[2].uid === user.uid ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-orange-300 dark:border-orange-900/40"
              )}>
                <img src={topUsers[2].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topUsers[2].uid}`} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-orange-400">
                <Medal size={20} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-300 dark:bg-orange-900/60 px-2 py-0.5 text-[10px] font-black text-orange-700 dark:text-orange-200 shadow-sm">#3</div>
            </div>
            <p className={cn(
              "max-w-[80px] truncate text-xs font-bold",
              topUsers[2].uid === user.uid ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
            )}>{topUsers[2].displayName}</p>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{topUsers[2].tokens.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-12 space-y-3 pb-20">
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading leaderboard...</div>
        ) : (
          topUsers.slice(3).map((u, idx) => (
            <motion.div
              key={u.uid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center justify-between rounded-2xl p-4 shadow-sm border transition-all",
                u.uid === user.uid 
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20" 
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "w-6 text-sm font-black",
                  u.uid === user.uid ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-700"
                )}>#{idx + 4}</span>
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-transparent">
                  <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} alt="" className="h-full w-full object-cover" />
                </div>
                <p className={cn(
                  "font-bold",
                  u.uid === user.uid ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-100"
                )}>{u.displayName}</p>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <span className="text-sm font-black">{u.tokens.toLocaleString()}</span>
                <Medal size={14} className={u.uid === user.uid ? "text-indigo-400" : "text-slate-300 dark:text-slate-700"} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
