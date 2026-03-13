import { User } from '../types';
import { User as UserIcon, Moon, Info, Phone, HelpCircle, FileText, Shield, LogOut, ChevronRight, Share2, Sun, X, Copy } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

interface SettingsProps {
  user: User;
}

export default function Settings({ user }: SettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      signOut(auth);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, message: string = 'Referral code copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const menuItems = [
    { icon: UserIcon, label: 'Profile Info', color: 'text-blue-500', onClick: () => setIsEditing(true) },
    { 
      icon: theme === 'dark' ? Sun : Moon, 
      label: 'Dark Mode', 
      color: 'text-purple-500', 
      toggle: true, 
      active: theme === 'dark',
      onClick: toggleTheme 
    },
    { icon: Info, label: 'About Us', color: 'text-indigo-500' },
    { icon: Phone, label: 'Contact Us', color: 'text-orange-500' },
    { icon: HelpCircle, label: 'FAQs', color: 'text-pink-500' },
    { icon: FileText, label: 'Terms & Conditions', color: 'text-slate-500' },
    { icon: Shield, label: 'Privacy Policy', color: 'text-emerald-500' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Settings</h2>

      {/* Profile Card */}
      <div className="mt-8 flex items-center gap-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
          <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase text-white"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.displayName);
                  }}
                  className="rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{user.displayName}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
            </>
          )}
          <div className="mt-2 inline-block rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {user.role}
          </div>
        </div>
      </div>

      {/* Refer Friends Section */}
      <div className="mt-8 rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
        <div className="flex items-center gap-3">
          <Share2 size={24} />
          <h3 className="text-lg font-black uppercase tracking-tighter">Refer Friends</h3>
        </div>
        <p className="mt-2 text-xs text-indigo-100 opacity-80">Invite your friends and get 100 tokens for each referral!</p>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Your Code</span>
              <span className="font-mono text-xl font-black tracking-widest">{user.referralCode}</span>
            </div>
            <button 
              onClick={() => copyToClipboard(user.referralCode)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Copy size={18} />
            </button>
          </div>

          <button 
            onClick={() => {
              const link = `${window.location.origin}/?ref=${user.referralCode}`;
              copyToClipboard(link, 'Referral link copied to clipboard!');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-indigo-600 transition-all active:scale-95"
          >
            <Share2 size={16} />
            Copy Link
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-8 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
            className="flex w-full items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            {item.toggle ? (
              <div className={`h-6 w-11 rounded-full p-1 transition-colors ${item.active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <motion.div 
                  animate={{ x: item.active ? 20 : 0 }}
                  className="h-4 w-4 rounded-full bg-white shadow-sm" 
                />
              </div>
            ) : (
              <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
            )}
          </motion.button>
        ))}

        <button
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 dark:bg-red-900/10 py-4 font-bold text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Money Man v1.0.0</p>
        <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">Made with ❤️ for Earners</p>
      </div>
    </div>
  );
}
