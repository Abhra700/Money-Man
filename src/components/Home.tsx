import { User } from '../types';
import { Bell, User as UserIcon, Coins, ChevronRight, Gamepad2, ClipboardCheck, Video, Gift, Share2, Search, Trophy, Wallet, RotateCw, Calculator, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const categories = [
    { name: 'Spin', icon: RotateCw, color: 'bg-red-500', path: '/spin' },
    { name: 'Math', icon: Calculator, color: 'bg-blue-500', path: '/math' },
    { name: 'Color', icon: Palette, color: 'bg-green-500', path: '/color' },
    { name: 'Quiz', icon: Search, color: 'bg-orange-500', path: '/tasks' },
  ];

  const sections = [
    { title: 'Playtime Games', items: ['Game 1', 'Game 2'], icon: Gamepad2 },
    { title: 'Offerwall Games', items: ['Offer 1', 'Offer 2'], icon: Gift },
    { title: 'Prime Surveys', items: ['Survey 1', 'Survey 2'], icon: ClipboardCheck },
    { title: 'Watch Videos', items: ['Video 1', 'Video 2'], icon: Video },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="h-full w-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Welcome back,</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{user.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/payout">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <Coins size={18} className="text-yellow-500" />
              <span className="font-black text-slate-800 dark:text-slate-100">{user.tokens.toLocaleString()}</span>
            </motion.div>
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Payout Quick Action */}
      <Link to="/payout" className="mt-8 block">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Ready to Payout?</h2>
              <p className="mt-1 text-xs text-emerald-50) opacity-80">Redeem your tokens for real rewards now!</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm w-fit">
                <Wallet size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Withdraw Now</span>
              </div>
            </div>
            <div className="opacity-30">
              <Gift size={64} />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        </div>
      </Link>

      {/* Participate & Earn */}
      <div className="mt-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Participate & Earn</h3>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.path || '/tasks'} className="flex flex-col items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.color} text-white shadow-lg`}
              >
                <cat.icon size={24} />
              </motion.div>
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Redeem Code Section */}
      <div className="mt-8 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <Gift size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">Redeem Code</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Enter promo code to get free tokens</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
        </div>
      </div>

      {/* Main Sections */}
      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{section.title}</h3>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">View All</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {section.items.map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <section.icon size={20} />
                  </div>
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-100">{item}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Earn up to 500 tokens</p>
                  <div className="mt-3 flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Coins size={12} className="text-yellow-500" />
                    <span className="text-xs font-black">+500</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="mt-8 pb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Recommended Games</h3>
        <div className="mt-4 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-3xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Action Game {i}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Adventure • 4.5 ★</p>
                </div>
              </div>
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">PLAY</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
