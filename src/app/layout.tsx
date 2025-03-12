import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/firebase/useAuth';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Use Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fitness Tracker - Angela\'s Wedding Countdown',
  description: 'Track your fitness goals leading up to Angela\'s wedding',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
