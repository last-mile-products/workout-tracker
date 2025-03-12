'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/useAuth';

export default function Home() {
  const { user, loading, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth/login');
    } else if (!isOnboarded) {
      router.push('/auth/onboarding');
    } else {
      router.push('/dashboard');
    }
  }, [user, loading, isOnboarded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  );
}
