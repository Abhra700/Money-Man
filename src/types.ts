export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  tokens: number;
  referralCode: string;
  referredBy?: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastCheckIn?: string;
  gameChances?: {
    spin: { count: number; lastReset: string };
    math: { count: number; lastReset: string };
    color: { count: number; lastReset: string };
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardTokens: number;
  type: 'daily' | 'ad' | 'survey' | 'game' | 'referral' | 'quiz' | 'spin' | 'math' | 'color';
  active: boolean;
}

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  tokensEarned: number;
  completedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  tokensDeducted: number;
  rewardType: 'Google Play' | 'Paytm Cash' | 'UPI';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  bonusTokens: number;
  createdAt: string;
}
