// Sidebar navigation component for desktop view
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  User2Icon, 
  HomeIcon, 
  MessageSquareIcon, 
  TrophyIcon, 
  LogOutIcon 
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/useAuth';

// Navigation items with their icons and paths
const navItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: <HomeIcon className="h-5 w-5" /> 
  },
  { 
    name: 'Profile', 
    path: '/profile', 
    icon: <User2Icon className="h-5 w-5" /> 
  },
  { 
    name: 'Chat', 
    path: '/chat', 
    icon: <MessageSquareIcon className="h-5 w-5" /> 
  },
  { 
    name: 'Leaderboard', 
    path: '/leaderboard', 
    icon: <TrophyIcon className="h-5 w-5" /> 
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Handle logout button click
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="hidden md:flex flex-col bg-card w-64 h-screen fixed top-0 left-0 pt-20 pb-6 px-4 shadow-md">
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout button at the bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 mt-auto rounded-md text-sm font-medium text-destructive hover:bg-muted transition-colors"
      >
        <LogOutIcon className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
} 