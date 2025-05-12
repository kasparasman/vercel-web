'use client';

import { useUser } from '../context/UserContext';
import Link from 'next/link';
import { logOut } from '../lib/firebase-client';

export default function Header() {
  const { user, loading } = useUser();
  if (loading) return null;

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between">
      <Link href="/" className="font-bold">My Discussion App</Link>
      <div>
        {user ? (
          <>
            <span className="mr-4">Hi, {user.email}</span>
            <button
              onClick={() => logOut()}
              className="px-3 py-1 bg-red-500 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="mr-4 hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
