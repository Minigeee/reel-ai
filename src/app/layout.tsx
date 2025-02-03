import { MobileLayout } from '@/components/layout/mobile-layout';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Reel AI',
  description: 'AI-powered short video platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn(inter.className, 'bg-background antialiased')}>
        <Providers>
          <MobileLayout>{children}</MobileLayout>
        </Providers>
      </body>
    </html>
  );
}
