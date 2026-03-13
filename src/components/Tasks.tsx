import { useState, useEffect } from 'react';
import { User, Task } from '../types';
import { Coins, CheckCircle2, Play, ExternalLink, Calendar, Video, Smartphone, ClipboardCheck, RotateCw, Calculator, Palette, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { OperationType, handleFirestoreError } from '../App';

interface TasksProps {
  user: User;
}

export default function Tasks({ user }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(collection(db, 'tasks'), where('active', '==', true));
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDailyCheckIn = async () => {
    if (checkingIn) return;
    
    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = user.lastCheckIn?.split('T')[0];
    
    if (lastCheckIn === today) {
      alert('You have already checked in today!');
      return;
    }

    setCheckingIn(true);
    try {
      const reward = 50;
      await updateDoc(doc(db, 'users', user.uid), {
        tokens: increment(reward),
        lastCheckIn: new Date().toISOString()
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'earn',
        amount: reward,
        description: 'Daily Check-in Reward',
        createdAt: new Date().toISOString()
      });

      alert(`Successfully checked in! You earned ${reward} tokens.`);
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Referral code copied to clipboard!');
  };

  const completeTask = async (task: Task) => {
    try {
      // In a real app, this would be triggered after an ad or survey completion
      await updateDoc(doc(db, 'users', user.uid), {
        tokens: increment(task.rewardTokens)
      });

      await addDoc(collection(db, 'userTasks'), {
        userId: user.uid,
        taskId: task.id,
        tokensEarned: task.rewardTokens,
        completedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'earn',
        amount: task.rewardTokens,
        description: `Completed Task: ${task.title}`,
        createdAt: new Date().toISOString()
      });

      alert(`Task completed! You earned ${task.rewardTokens} tokens.`);
    } catch (error) {
      console.error('Task completion error:', error);
    }
  };

  const taskIcons: Record<string, any> = {
    daily: Calendar,
    ad: Video,
    survey: ClipboardCheck,
    game: Play,
    referral: Smartphone,
    quiz: CheckCircle2
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Tasks</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500">Complete tasks to earn more tokens</p>

      {/* Daily Check-in */}
      <div className="mt-8 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <h3 className="font-bold uppercase tracking-widest">Daily Reward</h3>
            </div>
            <div className="flex items-center gap-1">
              <Coins size={16} className="text-yellow-400" />
              <span className="font-black">50</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Come back every day to claim your free tokens!</p>
          <button
            onClick={handleDailyCheckIn}
            disabled={checkingIn}
            className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {checkingIn ? 'Checking in...' : 'Claim Reward'}
          </button>
        </div>
      </div>

      {/* Games & Challenges */}
      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Games & Challenges</h3>
        <div className="grid grid-cols-1 gap-4">
          <Link to="/spin">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <RotateCw size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Lucky Spin</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Win up to 500 tokens</p>
                    <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                      {20 - (user.gameChances?.spin?.lastReset === new Date().toISOString().split('T')[0] ? user.gameChances.spin.count : 0)} / 20
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </motion.div>
          </Link>

          <Link to="/math">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Calculator size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Math Master</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Earn 20 tokens each</p>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {20 - (user.gameChances?.math?.lastReset === new Date().toISOString().split('T')[0] ? user.gameChances.math.count : 0)} / 20
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </motion.div>
          </Link>

          <Link to="/color">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <Palette size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Color Match</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Earn 15 tokens each</p>
                    <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                      {20 - (user.gameChances?.color?.lastReset === new Date().toISOString().split('T')[0] ? user.gameChances.color.count : 0)} / 20
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Available Tasks</h3>
        
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No tasks available right now.</div>
        ) : (
          tasks.map((task) => {
            const Icon = taskIcons[task.type] || CheckCircle2;
            return (
              <motion.div
                key={task.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{task.title}</p>
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                      <Coins size={12} />
                      <span className="text-xs font-black">+{task.rewardTokens} Tokens</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => completeTask(task)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white"
                >
                  <ExternalLink size={18} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Referral Banner */}
      <div className="mt-8 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
        <h3 className="text-lg font-black uppercase tracking-tighter">Refer & Earn</h3>
        <p className="mt-1 text-xs text-indigo-100 opacity-80">Invite your friends and get 100 tokens for each referral!</p>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <span className="font-mono font-bold tracking-widest">{user.referralCode}</span>
          <button 
            onClick={() => copyToClipboard(user.referralCode)}
            className="text-xs font-bold uppercase tracking-widest"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
}
