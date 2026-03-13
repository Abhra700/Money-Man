import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Trophy, History, Settings, LayoutDashboard } from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: User;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 shadow-lg">
        <div className="mx-auto flex max-w-md justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-1 transition-colors",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-indigo-400"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
          
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className={cn(
                "flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-1 transition-colors",
                location.pathname === '/admin' ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400 hover:text-red-400"
              )}
            >
              <LayoutDashboard size={24} strokeWidth={location.pathname === '/admin' ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
