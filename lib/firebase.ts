import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getIdToken } from "firebase/auth";

const clientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase client if it hasn't been initialized yet
if (!getApps().length) {
  initializeApp(clientConfig);
}

// Client-side Auth
export const firebaseAuth = getAuth();

// Helper functions for authentication
export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(firebaseAuth, email, password);

export const signUp = (email: string, password: string) => 
  createUserWithEmailAndPassword(firebaseAuth, email, password);

export const logOut = () => signOut(firebaseAuth);

// Get the ID token for API authentication
export const getUserIdToken = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

// Mock admin SDK verification for the demo
// In a real app, this would use firebase-admin properly
export const verifyIdToken = async (token: string) => {
  if (!token) throw new Error("No token provided");
  
  // This is a mock implementation for demo purposes
  // In a real app, this would use admin.auth().verifyIdToken()
  try {
    // Simulating token verification
    // For demo: if token starts with "valid-", consider it valid
    if (token.startsWith("valid-")) {
      const uid = token.split("-")[1];
      return { uid };
    }
    throw new Error("Invalid token");
  } catch (error) {
    throw new Error("Failed to verify token");
  }
};

// Export utility function to get the current user's ID token
export { getIdToken };