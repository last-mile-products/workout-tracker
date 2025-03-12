'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Theme provider component to enable dark/light mode throughout the app
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 