'use client'

import { ChartBarIcon, PlusCircleIcon, ChatBubbleBottomCenterIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AdminBadge } from '@/components/ui/admin-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from './UserContext';

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const navigation = [
  { name: 'View/Add Feedback (⌘ K)', href: '/', icon: PlusCircleIcon },
  { name: 'All Feedback', href: '/feedback', icon: ChatBubbleBottomCenterIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Product Areas', href: '/areas', icon: TableCellsIcon },
  { name: 'Accounts', href: '/accounts', icon: TableCellsIcon },
];

export function Layout({ children, fullWidth = false }: LayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string) ||
    undefined;

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="bg-black shadow">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-semibold text-white hover:text-gray-200 transition-colors">▲vercel/feedback</Link>
                <nav className="hidden md:flex items-center space-x-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <AdminBadge />
                {user && avatarUrl && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen((open) => !open)}
                      className="focus:outline-none cursor-pointer"
                      aria-label="User menu"
                    >
                      <Image
                        src={avatarUrl}
                        alt="User avatar"
                        width={50}
                        height={50}
                        className="w-10 h-10 rounded-full border-2 border-green-500 shadow-sm object-cover transition-all duration-150"
                      />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
                        <div className="py-3 px-4 border-b border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                          <div className="text-sm font-medium text-gray-900 break-all">{user.email}</div>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/user"
                            className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-800 transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className={fullWidth ? "flex-1 overflow-y-auto px-1 py-6" : "flex-1 overflow-y-auto p-6"}>
          <div className={fullWidth ? "w-full max-w-full min-w-0" : "w-4/5 mx-auto"}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 