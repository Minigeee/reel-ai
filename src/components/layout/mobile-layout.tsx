'use client';

import { useUser } from '@/lib/hooks/use-user';
import { useAuth } from '@/lib/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Home, Plus, Search, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center text-sm',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div className='h-6 w-6'>{icon}</div>
      <span className='mt-1 text-xs'>{label}</span>
    </Link>
  );
}

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Prefetch user data
  const { user } = useAuth();
  useUser(user?.id);

  return (
    <div className='flex h-[100dvh] flex-col'>
      {/* Main content area */}
      <main className='flex-1 overflow-auto'>{children}</main>

      {/* Bottom navigation bar */}
      <nav className='flex items-center justify-between border-t bg-background px-4 py-2'>
        <NavItem
          href='/'
          icon={<Home className='h-full w-full' />}
          label='Home'
          isActive={pathname === '/'}
        />
        <NavItem
          href='/discover'
          icon={<Search className='h-full w-full' />}
          label='Discover'
          isActive={pathname === '/discover'}
        />
        <NavItem
          href='/create'
          icon={<Plus className='h-full w-full' />}
          label='Create'
          isActive={pathname === '/create'}
        />
        <NavItem
          href='/profile'
          icon={<User className='h-full w-full' />}
          label='Profile'
          isActive={pathname === '/profile'}
        />
        <NavItem
          href='/settings'
          icon={<Settings className='h-full w-full' />}
          label='Settings'
          isActive={pathname === '/settings'}
        />
      </nav>
    </div>
  );
}
