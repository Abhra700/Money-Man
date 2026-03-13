import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, ArrowLeft, CheckCircle2, XCircle, RefreshCw, Zap } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface ColorChooseProps {
  user: User;
}

export default function ColorChoose({ user }: ColorChooseProps) {
  const [targetColor, setTargetColor] = useState({ name: '', hex: '' });
  const [options, setOptions] = useState<{ name: string, hex: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [loading, setLoading] = useState(false);
  const [chances, setChances] = useState(20);

  const colors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Cyan', hex: '#06b6d4' },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const userChances = user.gameChances?.color;
    
    if (userChances && userChances.lastReset === today) {
      setChances(20 - userChances.count);
    } else {
      setChances(20);
    }
    generateGame();
  }, [user]);

  const generateGame = () => {
    const shuffled = [...colors].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    const target = selected[Math.floor(Math.random() * selected.length)];
    
    setTargetColor(target);
    setOptions(selected);
    setStatus('idle');
  };

  const handleChoice = async (choice: { name: string, hex: string }) => {
    if (status !== 'idle' || loading || chances <= 0) return;

    if (choice.name === targetColor.name) {
      setStatus('correct');
      setLoading(true);
      setChances(prev => prev - 1);
      try {
        const reward = 15;
        const today = new Date().toISOString().split('T')[0];
        const currentCount = user.gameChances?.color?.lastReset === today ? (user.gameChances?.color?.count || 0) : 0;

        await updateDoc(doc(db, 'users', user.uid), {
          tokens: increment(reward),
          [`gameChances.color`]: {
            count: currentCount + 1,
            lastReset: today
          }
        });

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type: 'earn',
          amount: reward,
          description: 'Color Match Reward',
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Color reward error:', error);
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
        <h1 className="text-4xl font-bold tracking-tight">Color Match</h1>
        <p className="mt-2 opacity-80 italic">Pick the correct color</p>
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
        <div className="w-full max-w-sm overflow-hidden rounded-[3rem] border border-white/20 bg-white/5 p-10 backdrop-blur-sm text-center">
          <p className="text-sm font-black uppercase tracking-widest text-white/60">Choose the correct color</p>
          
          <div className="mt-8 flex flex-col items-center">
            <div 
              className="h-32 w-32 rounded-3xl shadow-lg border-4 border-white/20"
              style={{ backgroundColor: targetColor.hex }}
            ></div>
            <h3 className="mt-6 text-3xl font-black uppercase tracking-tighter text-white">
              {status === 'wrong' ? 'Oops!' : targetColor.name}
            </h3>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => handleChoice(option)}
                disabled={status !== 'idle' || chances <= 0}
                className={`group relative h-24 rounded-2xl border-2 transition-all active:scale-95 ${
                  status === 'idle' 
                    ? 'border-white/10 hover:border-white/40' 
                    : option.name === targetColor.name 
                      ? 'border-white bg-white/20' 
                      : 'border-white/5 opacity-50'
                }`}
              >
                <div 
                  className="mx-auto h-8 w-8 rounded-full shadow-sm"
                  style={{ backgroundColor: option.hex }}
                ></div>
                <span className="mt-2 block text-xs font-black uppercase tracking-widest text-white/80">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          {status !== 'idle' && (
            <div className="mt-8 space-y-4">
              <div className={`flex items-center justify-center gap-2 rounded-2xl py-4 font-bold ${status === 'correct' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-200'}`}>
                {status === 'correct' ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Correct! +15 Tokens</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    <span>Wrong choice!</span>
                  </>
                )}
              </div>
              <button
                onClick={generateGame}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white/10 py-5 font-black uppercase tracking-widest text-white transition-all hover:bg-white/20 active:scale-95"
              >
                <RefreshCw size={20} />
                Play Again
              </button>
            </div>
          )}

          {chances <= 0 && status === 'idle' && (
            <div className="mt-8 rounded-2xl bg-red-500/20 py-4 font-bold text-red-200">
              No Chances Left Today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
