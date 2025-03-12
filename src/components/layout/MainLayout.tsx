// Main layout component that includes header, sidebar, and bottom navigation
'use client';

import { useAuth } from '@/lib/firebase/useAuth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toaster } from '@/components/ui/sonner';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isOnboarded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle authentication and routing
  useEffect(() => {
    // Skip redirection during loading
    if (loading) return;

    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // If user is logged in but not onboarded, redirect to onboarding
    // (unless they're already on the onboarding page)
    if (user && !isOnboarded && !pathname.startsWith('/auth/onboarding')) {
      router.push('/auth/onboarding');
      return;
    }

    // If user is logged in and onboarded, but on an auth page, redirect to dashboard
    if (user && isOnboarded && pathname.startsWith('/auth')) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, isOnboarded, pathname, router]);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // For auth pages, show minimal layout
  if (pathname.startsWith('/auth')) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        {children}
      </div>
    );
  }

  // Main layout for authenticated and onboarded users
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="md:ml-64 pt-16 pb-16 md:pb-6 px-4">
        <div className="max-w-4xl mx-auto py-6">
          {children}
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
} 