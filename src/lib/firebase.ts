/**
 * Firebase & MongoDB Authentication Service for REWEAVE
 * 
 * Supports:
 * - Real Authentication with MongoDB Atlas & Firebase Auth
 * - Strict 2-Email Restriction for Admin Access
 * - Separate Storage for Customers, Tailors, and Admins
 * - Enforces One Role Per Email Across the Entire Platform
 * - Zero Automatic Fake Logins
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { User, UserRole } from '../types';
import { isAuthorizedAdmin, getAuthorizedAdminEmails } from '../config/adminConfig';
import { loginUserViaBackend, registerUserViaBackend } from './api';

// Web App's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyBj-RuON8Oloid8qIPcxpFxnhb_e3BqQ",
  authDomain: "reweave-b692f.firebaseapp.com",
  projectId: "reweave-b692f",
  storageBucket: "reweave-b692f.firebasestorage.app",
  messagingSenderId: "518556687693",
  appId: "1:518556687693:web:7676ef3dd7876f3ce0ab04",
  measurementId: "G-NK8YVXPLKD"
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.projectId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    try {
      analytics = getAnalytics(app);
    } catch {
      // analytics optional in some browser environments
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export { app, auth, analytics, googleProvider };

/**
 * Determine user role based on email & selected role
 */
export function resolveUserRole(email: string, requestedRole: UserRole = 'customer'): UserRole {
  const normalizedEmail = email.trim().toLowerCase();
  if (isAuthorizedAdmin(normalizedEmail)) {
    return 'admin';
  }
  if (requestedRole === 'admin') {
    return 'customer';
  }
  return requestedRole;
}

/**
 * Convert Firebase User to REWEAVE User profile
 */
export function mapFirebaseUserToAppUser(
  fbUser: FirebaseUser,
  role: UserRole = 'customer',
  location: string = ''
): User {
  const finalRole = resolveUserRole(fbUser.email || '', role);
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Reweave User',
    email: fbUser.email || '',
    role: finalRole,
    tailorId: finalRole === 'tailor' ? `T_${Date.now().toString().slice(-4)}` : undefined,
    profileImage: fbUser.photoURL || '',
    location,
    createdAt: new Date().toISOString(),
    savedDesignIds: [],
  };
}

/**
 * Real Sign in using Email and Password
 */
export async function loginWithFirebaseEmail(
  email: string,
  pass: string,
  requestedRole: UserRole = 'customer'
): Promise<{ user: User; error?: string }> {
  const normalized = email.trim().toLowerCase();

  // If requesting admin role, enforce 2-email restriction
  if (requestedRole === 'admin' && !isAuthorizedAdmin(normalized)) {
    const [a1, a2] = getAuthorizedAdminEmails();
    return {
      user: null as any,
      error: `Access Denied: Only designated admin accounts (${a1}, ${a2}) can access the Admin Dashboard.`,
    };
  }

  // 1. Authenticate with real MongoDB Atlas backend
  const backendResult = await loginUserViaBackend(normalized, pass, requestedRole);
  if (backendResult.user) {
    if (isFirebaseConfigured() && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch {
        // Mongo is primary authority
      }
    }
    return { user: backendResult.user };
  }

  // If backend reported credentials error (wrong password, account not found, role conflict):
  if (backendResult.error) {
    return { user: null as any, error: backendResult.error };
  }

  // 2. Try Firebase Auth if backend was unreachable
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const appUser = mapFirebaseUserToAppUser(userCredential.user, requestedRole);
      return { user: appUser };
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
        return { user: null as any, error: 'Invalid email or password. Please verify your credentials.' };
      }
      if (fbErr.code === 'auth/wrong-password') {
        return { user: null as any, error: 'Incorrect password. Please try again.' };
      }
      if (fbErr.code === 'auth/configuration-not-found') {
        return {
          user: null as any,
          error: 'No account found with this email. Please click "Create a new account" to register.',
        };
      }
      return { user: null as any, error: fbErr.message || 'Authentication failed.' };
    }
  }

  return {
    user: null as any,
    error: 'Authentication failed. Please verify credentials or register first.',
  };
}

/**
 * Real Sign Up with Email and Password
 */
export async function registerWithFirebaseEmail(
  email: string,
  pass: string,
  name: string,
  role: UserRole = 'customer',
  location: string = '',
  tailorShopName?: string,
  latitude?: number,
  longitude?: number
): Promise<{ user: User; error?: string }> {
  const normalized = email.trim().toLowerCase();

  // Strict 2-Email Restriction for Admin
  if (role === 'admin' && !isAuthorizedAdmin(normalized)) {
    const [a1, a2] = getAuthorizedAdminEmails();
    const emailsList = [a1, a2].filter(Boolean).join(', ');
    return {
      user: null as any,
      error: `Registration Blocked: Only authorized administrator emails ${emailsList ? `(${emailsList})` : ''} can register as Admin.`,
    };
  }

  // 1. Register with real MongoDB Atlas backend
  const backendResult = await registerUserViaBackend({
    email: normalized,
    pass,
    name,
    role,
    location,
    tailorShopName,
    latitude,
    longitude,
  });

  if (backendResult.user) {
    if (isFirebaseConfigured() && auth) {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch {
        // Mongo is primary authority
      }
    }
    return { user: backendResult.user };
  }

  // If backend returned error (e.g. duplicate email, role conflict):
  if (backendResult.error) {
    return { user: null as any, error: backendResult.error };
  }

  return {
    user: null as any,
    error: 'Registration could not be completed. Please try again.',
  };
}

/**
 * Sign In with Google OAuth
 */
export async function loginWithFirebaseGoogle(
  preferredRole: UserRole = 'customer',
  tailorShopName?: string
): Promise<{ user: User; error?: string }> {
  if (isFirebaseConfigured() && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const appUser = mapFirebaseUserToAppUser(result.user, preferredRole);
      return { user: appUser };
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        return {
          user: null as any,
          error: 'Google Sign-In is not enabled on this Firebase project. Please use the Email and Password Sign In or Sign Up tabs.',
        };
      }
      return { user: null as any, error: err.message || 'Google Sign-In failed.' };
    }
  }

  return {
    user: null as any,
    error: 'Firebase is not initialized. Please use Email and Password.',
  };
}

/**
 * Sign Out from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    }
  }
}

/**
 * Listen to auth state changes
 */
export function onFirebaseAuthStateChanged(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const appUser = mapFirebaseUserToAppUser(fbUser);
      callback(appUser);
    } else {
      callback(null);
    }
  });
}
