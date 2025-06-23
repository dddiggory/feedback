'use client'

import { User, LogOut } from "lucide-react";
import { ChartBarIcon, ChatBubbleBottomCenterIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

const navigation = [
  { name: 'Submit Feedback', href: '/', icon: ChatBubbleBottomCenterIcon },
  { name: 'Analytics & Reporting', href: '/reports', icon: ChartBarIcon },
  { name: 'Browse by Product Area', href: '/browse/product_areas', icon: TableCellsIcon },
  { name: 'Browse All', href: '/browse/all', icon: TableCellsIcon },
];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col">
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
                {user && (
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-4/5 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 