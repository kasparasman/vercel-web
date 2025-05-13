'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ProfilePopup from './ProfilePopup';

export default function Header() {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <Link href="/" className="font-bold">Discussion App</Link>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <>
            <ProfilePopup />
            <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 rounded">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
