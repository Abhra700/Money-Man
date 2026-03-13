import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, ArrowLeft, CheckCircle2, XCircle, RefreshCw, Zap } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface MathSolveProps {
  user: User;
}

export default function MathSolve({ user }: MathSolveProps) {
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [loading, setLoading] = useState(false);
  const [chances, setChances] = useState(20);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const userChances = user.gameChances?.math;
    
    if (userChances && userChances.lastReset === today) {
      setChances(20 - userChances.count);
    } else {
      setChances(20);
    }
    generateProblem();
  }, [user]);

  const generateProblem = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;

    if (op === '*') {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      ans = a * b;
    } else {
      a = Math.floor(Math.random() * 100) + 1;
      b = Math.floor(Math.random() * 100) + 1;
      if (op === '-') {
        if (a < b) [a, b] = [b, a];
        ans = a - b;
      } else {
        ans = a + b;
      }
    }

    setProblem({ a, b, op, ans });
    setUserAnswer('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer || loading || status !== 'idle' || chances <= 0) return;

    const isCorrect = parseInt(userAnswer) === problem.ans;
    
    if (isCorrect) {
      setStatus('correct');
      setLoading(true);
      setChances(prev => prev - 1);
      try {
        const reward = 20;
        const today = new Date().toISOString().split('T')[0];
        const currentCount = user.gameChances?.math?.lastReset === today ? (user.gameChances?.math?.count || 0) : 0;

        await updateDoc(doc(db, 'users', user.uid), {
          tokens: increment(reward),
          [`gameChances.math`]: {
            count: currentCount + 1,
            lastReset: today
          }
        });

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type: 'earn',
          amount: reward,
          description: 'Math Master Reward',
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Math reward error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[#2ecc71] p-6 font-serif">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="mt-8 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">Math Master</h1>
        <p className="mt-2 opacity-80 italic">Solve to earn rewards</p>
      </div>

      {/* Chances Card */}
      <div className="mt-10 flex items-center justify-between rounded-3xl bg-white/10 p-6 text-white backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-lg">Remaining Chances</span>
        </div>
        <div className="rounded-full bg-white/20 px-6 py-2 font-bold text-lg">
          {chances} / 20
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <div className="w-full max-w-sm overflow-hidden rounded-[3rem] border border-white/20 bg-white/5 p-10 backdrop-blur-sm">
          <div className="flex justify-center gap-2 text-sm font-black uppercase tracking-widest text-white/60">
            <span>Solve to earn</span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins size={14} />
              <span>20</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-6xl font-black text-white">
            <span>{problem.a}</span>
            <span className="text-white/40">{problem.op === '*' ? '×' : problem.op}</span>
            <span>{problem.b}</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your Answer"
              disabled={status !== 'idle' || chances <= 0}
              className="w-full rounded-2xl bg-white/10 py-5 text-center text-3xl font-black text-white outline-none ring-2 ring-transparent transition-all focus:ring-white/20 placeholder:text-white/20"
            />

            {status === 'idle' ? (
              <button
                type="submit"
                disabled={chances <= 0}
                className="w-full rounded-3xl bg-white py-5 font-black uppercase tracking-widest text-[#2ecc71] shadow-xl transition-all hover:bg-opacity-90 active:scale-95 disabled:opacity-50"
              >
                {chances <= 0 ? 'No Chances Left' : 'Submit Answer'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center justify-center gap-2 rounded-2xl py-4 font-bold ${status === 'correct' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-200'}`}>
                  {status === 'correct' ? (
                    <>
                      <CheckCircle2 size={20} />
                      <span>Correct! +20 Tokens</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span>Wrong! Correct was {problem.ans}</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateProblem}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white/10 py-5 font-black uppercase tracking-widest text-white transition-all hover:bg-white/20 active:scale-95"
                >
                  <RefreshCw size={20} />
                  Next Problem
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

