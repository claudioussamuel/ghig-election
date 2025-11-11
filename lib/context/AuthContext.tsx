"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signUp, logOut } from '../firebase/auth';
import { hasUserVoted } from '../firebase/voting-service';
import { getUserRole } from '../firebase/admin-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasVoted: boolean;
  userRole: string;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  checkVoteStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');

  const checkVoteStatus = async () => {
    if (user) {
      const voted = await hasUserVoted(user.uid);
      setHasVoted(voted);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const voted = await hasUserVoted(user.uid);
        setHasVoted(voted);
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setHasVoted(false);
        setUserRole('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleLogOut = async () => {
    await logOut();
    setHasVoted(false);
    setUserRole('user');
  };

  const value = {
    user,
    loading,
    hasVoted,
    userRole,
    isAdmin: userRole === 'admin',
    signIn: handleSignIn,
    signUp: handleSignUp,
    logOut: handleLogOut,
    checkVoteStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
