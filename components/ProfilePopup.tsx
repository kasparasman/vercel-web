// components/ProfilePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { logOut } from '../lib/firebase-client';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';

export default function ProfilePopup() {
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<{ nickname: string; avatar_url: string } | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      user.getIdToken().then(token =>
        fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      )
      .then(r => r.json())
      .then(setProfile)
      .catch(console.error);
    }
  }, [user, loading]);

  if (!user || !profile) return null;

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  return (
    <>
      <img
        src={profile.avatar_url}
        onClick={() => setOpen(true)}
        className="h-8 w-8 rounded-full cursor-pointer"
        alt="Your avatar"
      />
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-xl"
            >
              ✕
            </button>
            <img
              src={profile.avatar_url}
              className="h-24 w-24 rounded-full mx-auto mb-2"
              alt="Avatar"
            />
            <h2 className="text-xl text-center mb-4">{profile.nickname}</h2>
            <div className="flex justify-center mb-4">
              <QRCode value={`${window.location.origin}/user/${profile.nickname}`} />
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full bg-red-500 text-white py-2 rounded"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
