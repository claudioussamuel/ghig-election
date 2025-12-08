import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

// Convert PIN to email format for Firebase
const pinToEmail = (pin: string): string => {
  return `pin-${pin}@vote.app`;
};

// Default password for PIN-based accounts
const PIN_PASSWORD = 'vote-pin-2024';

// Sign up with PIN
export const signUpWithPin = async (pin: string): Promise<UserCredential> => {
  try {
    const email = pinToEmail(pin);
    const userCredential = await createUserWithEmailAndPassword(auth, email, PIN_PASSWORD);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account with PIN');
  }
};

// Sign in with PIN
export const signInWithPin = async (pin: string): Promise<UserCredential> => {
  try {
    const email = pinToEmail(pin);
    const userCredential = await signInWithEmailAndPassword(auth, email, PIN_PASSWORD);
    return userCredential;
  } catch (error: any) {
    // If user doesn't exist, create account automatically
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      return await signUpWithPin(pin);
    }
    throw new Error(error.message || 'Failed to sign in with PIN');
  }
};

// Legacy email/password support (kept for backward compatibility)
export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Extract PIN from user email
export const getPinFromUser = (user: User): string | null => {
  if (user.email?.startsWith('pin-') && user.email.endsWith('@vote.app')) {
    return user.email.replace('pin-', '').replace('@vote.app', '');
  }
  return null;
};

