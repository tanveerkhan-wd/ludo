'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@/types/user';

interface AuthState {
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
  setAuth: (user: Partial<IUser> | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: !!user }),
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isAuthenticated: false });
        // Fallback for non-httpOnly cookies if any
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
