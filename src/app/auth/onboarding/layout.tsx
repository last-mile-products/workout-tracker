'use client';

import { useAuth } from '@/lib/firebase/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // If user is already onboarded, redirect to dashboard
    if (isOnboarded) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, isOnboarded, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Fitness Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s set up your profile to get started
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 