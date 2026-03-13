import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Coins, RotateCw, ArrowLeft, Zap } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface SpinWheelProps {
  user: User;
}

export default function SpinWheel({ user }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [chances, setChances] = useState(20);
  const controls = useAnimation();

  const segments = [10, 50, 20, 100, 30, 200, 40, 500];
  const segmentColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const userChances = user.gameChances?.spin;
    
    if (userChances && userChances.lastReset === today) {
      setChances(20 - userChances.count);
    } else {
      setChances(20);
    }
  }, [user]);

  const spin = async () => {
    if (spinning || chances <= 0) return;
    
    setSpinning(true);
    setResult(null);

    const randomRotation = 1800 + Math.floor(Math.random() * 360);
    const finalDegree = randomRotation % 360;
    const segmentIndex = Math.floor((360 - finalDegree) / (360 / segments.length)) % segments.length;
    const reward = segments[segmentIndex];

    await controls.start({
      rotate: randomRotation,
      transition: { duration: 4, ease: "easeOut" }
    });

    setResult(reward);
    setSpinning(false);
    setChances(prev => prev - 1);

    try {
      const today = new Date().toISOString().split('T')[0];
      const currentCount = user.gameChances?.spin?.lastReset === today ? (user.gameChances?.spin?.count || 0) : 0;

      await updateDoc(doc(db, 'users', user.uid), {
        tokens: increment(reward),
        [`gameChances.spin`]: {
          count: currentCount + 1,
          lastReset: today
        }
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'earn',
        amount: reward,
        description: 'Lucky Spin Reward',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Spin reward error:', error);
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
        <h1 className="text-4xl font-bold tracking-tight">Lucky Spin</h1>
        <p className="mt-2 opacity-80 italic">Spin to reveal your reward</p>
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

      {/* Game Area */}
      <div className="mt-10 flex flex-col items-center rounded-[3rem] border border-white/20 bg-white/5 p-10 backdrop-blur-sm">
        <div className="relative h-72 w-72">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 z-10 h-8 w-8 -translate-x-1/2 text-white">
            <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[32px] border-l-transparent border-r-transparent border-t-current"></div>
          </div>

          {/* Wheel */}
          <motion.div
            animate={controls}
            className="relative h-full w-full overflow-hidden rounded-full border-8 border-white/20 shadow-2xl"
          >
            {segments.map((val, i) => (
              <div
                key={i}
                className={`absolute h-full w-full ${segmentColors[i]}`}
                style={{
                  clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
                  transform: `rotate(${i * (360 / segments.length)}deg)`,
                  transformOrigin: '50% 50%'
                }}
              >
                <span 
                  className="absolute left-3/4 top-1/4 -translate-x-1/2 -translate-y-1/2 rotate-45 font-black text-white"
                  style={{ fontSize: '12px' }}
                >
                  {val}
                </span>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 z-20 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-[#2ecc71]"></div>
            </div>
          </motion.div>
        </div>

        <button
          onClick={spin}
          disabled={spinning || chances <= 0}
          className="mt-12 w-full rounded-3xl bg-white py-5 font-black uppercase tracking-widest text-[#2ecc71] shadow-xl transition-all hover:bg-opacity-90 active:scale-95 disabled:opacity-50"
        >
          {chances <= 0 ? 'No Chances Left' : spinning ? 'Spinning...' : 'Spin Now'}
        </button>

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 text-4xl font-black text-white">
              <Coins size={32} className="text-yellow-400" />
              <span>+{result}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
