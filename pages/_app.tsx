import '../app/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { UserProvider } from '../context/UserContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <main className={`${inter.className} min-h-screen bg-background text-foreground`}>
          <Component {...pageProps} />
          <Toaster />
        </main>
      </UserProvider>
    </ThemeProvider>
  );
}