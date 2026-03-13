import { useState } from 'react';
import { User, WithdrawalRequest } from '../types';
import { Coins, CreditCard, Smartphone, Gift, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface PayoutProps {
  user: User;
}

export default function Payout({ user }: PayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const rewards = [
    { id: 'gp10', type: 'Google Play', value: 10, tokens: 1000, icon: Gift },
    { id: 'gp30', type: 'Google Play', value: 30, tokens: 3000, icon: Gift },
    { id: 'gp50', type: 'Google Play', value: 50, tokens: 5000, icon: Gift },
    { id: 'gp80', type: 'Google Play', value: 80, tokens: 8000, icon: Gift },
    { id: 'gp160', type: 'Google Play', value: 160, tokens: 16000, icon: Gift },
    { id: 'gp350', type: 'Google Play', value: 350, tokens: 35000, icon: Gift },
    { id: 'paytm500', type: 'Paytm Cash', value: 500, tokens: 50000, icon: CreditCard },
    { id: 'upi1000', type: 'UPI', value: 1000, tokens: 100000, icon: Smartphone },
  ];

  const handleWithdraw = async (reward: typeof rewards[0]) => {
    if (user.tokens < reward.tokens) {
      alert('Insufficient tokens!');
      return;
    }

    if (!window.confirm(`Redeem ${reward.tokens} tokens for ₹${reward.value} ${reward.type}?`)) {
      return;
    }

    setLoading(true);
    try {
      // 1. Create withdrawal request
      const withdrawal: Partial<WithdrawalRequest> = {
        userId: user.uid,
        userEmail: user.email,
        amount: reward.value,
        tokensDeducted: reward.tokens,
        rewardType: reward.type as any,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'withdrawals'), withdrawal);

      // 2. Deduct tokens from user
      await updateDoc(doc(db, 'users', user.uid), {
        tokens: increment(-reward.tokens)
      });

      // 3. Add transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'redeem',
        amount: reward.tokens,
        description: `Redeemed for ₹${reward.value} ${reward.type}`,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/history'), 2000);
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Redeem</h2>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Your Balance</p>
          <div className="flex items-center gap-2">
            <Coins size={24} className="text-yellow-400" />
            <span className="text-3xl font-black">{user.tokens.toLocaleString()}</span>
          </div>
        </div>
        <div className="opacity-20">
          <Gift size={60} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            whileHover={{ y: -4 }}
            className="flex flex-col rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              <reward.icon size={24} />
            </div>
            <h4 className="mt-4 font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">₹{reward.value}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{reward.type}</p>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <Coins size={12} />
                <span className="text-xs font-black">{reward.tokens.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => handleWithdraw(reward)}
              disabled={loading || user.tokens < reward.tokens}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600"
            >
              WITHDRAW
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="mt-6 text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Success!</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Your withdrawal request has been sent.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
