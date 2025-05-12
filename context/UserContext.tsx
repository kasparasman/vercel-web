'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { firebaseAuth } from '../lib/firebase-client';
import { onAuthStateChanged, type User } from 'firebase/auth';

type UserContextType = { user: User | null; loading: boolean };
const UserContext = createContext<UserContextType>({ user: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
