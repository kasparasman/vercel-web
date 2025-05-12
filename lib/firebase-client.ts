// lib/firebase-client.ts
'use client'; // ensures this only runs in the browser

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type UserCredential
} from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!getApps().length) {
  initializeApp(cfg);
}

export const firebaseAuth = getAuth();

/**
 * Sign up a new user with email & password
 */
export function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

/**
 * Sign in an existing user with email & password
 */
export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

/**
 * Log out the current user
 */
export function logOut(): Promise<void> {
  return signOut(firebaseAuth);
}
