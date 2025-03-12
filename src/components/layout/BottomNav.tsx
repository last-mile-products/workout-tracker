// Bottom navigation component for mobile view
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  User2Icon, 
  HomeIcon, 
  MessageSquareIcon, 
  TrophyIcon 
} from 'lucide-react';

// Navigation items with their icons and paths (same as sidebar)
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-10">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-md text-xs font-medium
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
                }`}
            >
              <div className="mb-1">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 