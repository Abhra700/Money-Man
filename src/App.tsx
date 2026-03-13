import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, writeBatch, query, where, limit, updateDoc, increment, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User as AppUser, Task } from './types';
import Layout from './components/Layout';
import Home from './components/Home';
import Tasks from './components/Tasks';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Admin from './components/Admin';
import Payout from './components/Payout';
import SpinWheel from './components/SpinWheel';
import MathSolve from './components/MathSolve';
import ColorChoose from './components/ColorChoose';
import ErrorBoundary from './components/ErrorBoundary';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedTasks = async () => {
      try {
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        if (tasksSnap.empty) {
          const batch = writeBatch(db);
          const initialTasks: Task[] = [
            { id: 't1', title: 'Watch Video Ad', description: 'Watch a 30s video to earn tokens', rewardTokens: 20, type: 'ad', active: true },
            { id: 't2', title: 'Complete Profile', description: 'Fill in your profile details', rewardTokens: 100, type: 'survey', active: true },
            { id: 't3', title: 'Daily Quiz', description: 'Answer 5 questions correctly', rewardTokens: 50, type: 'quiz', active: true },
            { id: 't4', title: 'Try New Game', description: 'Play for 5 minutes', rewardTokens: 200, type: 'game', active: true },
          ];
          initialTasks.forEach(task => {
            batch.set(doc(db, 'tasks', task.id), task);
          });
          await batch.commit();
        }
      } catch (error) {
        // If unauthenticated, this might fail, which is fine for seeding
        console.warn('Task seeding skipped or failed:', error);
      }
    };
    
    // Only seed if we are likely to have permissions or if it's the first run
    // We'll try anyway but catch the error
    seedTasks();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const adminEmails = ['abhramondal10@gmail.com', 'abhram683@gmail.com'];
        const isEmailAdmin = firebaseUser.email && adminEmails.includes(firebaseUser.email);

        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          
          // Auto-upgrade role if email is in admin list but role is 'user'
          if (isEmailAdmin && userData.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
          }

          // Listen for real-time updates to user data (tokens, etc.)
          const unsubUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUser(doc.data() as AppUser);
            }
          });
          setLoading(false);
          return () => unsubUser();
        } else {
          // Create new user
          const pendingReferralCode = localStorage.getItem('pendingReferralCode');
          let initialTokens = 0;
          let referredBy = '';

          if (pendingReferralCode) {
            try {
              const q = query(collection(db, 'users'), where('referralCode', '==', pendingReferralCode), limit(1));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const referrerDoc = querySnapshot.docs[0];
                const referrerData = referrerDoc.data();
                referredBy = referrerDoc.id;
                initialTokens = 100; // Bonus for new user

                // Give bonus to referrer
                await updateDoc(doc(db, 'users', referredBy), {
                  tokens: increment(100)
                });

                // Record transaction for referrer
                await addDoc(collection(db, 'transactions'), {
                  userId: referredBy,
                  type: 'earn',
                  amount: 100,
                  description: `Referral Bonus (from ${firebaseUser.email})`,
                  createdAt: new Date().toISOString()
                });
              }
            } catch (err) {
              console.error('Referral processing error:', err);
            } finally {
              localStorage.removeItem('pendingReferralCode');
            }
          }

          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
            tokens: initialTokens,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            role: isEmailAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          };

          if (referredBy) {
            (newUser as any).referredBy = referredBy;
          }

          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

          // Record transaction for new user if they got a bonus
          if (initialTokens > 0) {
            await addDoc(collection(db, 'transactions'), {
              userId: firebaseUser.uid,
              type: 'earn',
              amount: initialTokens,
              description: 'Referral Sign-up Bonus',
              createdAt: new Date().toISOString()
            });
          }

          setUser(newUser);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {!user ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <Route element={<Layout user={user} />}>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/tasks" element={<Tasks user={user} />} />
              <Route path="/leaderboard" element={<Leaderboard user={user} />} />
              <Route path="/history" element={<History user={user} />} />
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="/payout" element={<Payout user={user} />} />
              <Route path="/spin" element={<SpinWheel user={user} />} />
              <Route path="/math" element={<MathSolve user={user} />} />
              <Route path="/color" element={<ColorChoose user={user} />} />
              {user.role === 'admin' && <Route path="/admin" element={<Admin user={user} />} />}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
