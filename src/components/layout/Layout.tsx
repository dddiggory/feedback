'use client'

import { Sidebar } from './Sidebar';
import { LogFeedbackDialog } from '../feedback/LogFeedbackDialog';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HomeIcon, ChartBarIcon, ChatBubbleLeftRightIcon, UserGroupIcon, ChatBubbleBottomCenterIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Submit Feedback', href: '/', icon: ChatBubbleBottomCenterIcon },
  { name: 'Analytics & Reporting', href: '/analytics', icon: ChartBarIcon },
  { name: 'Browse by Product Area', href: '/team', icon: TableCellsIcon },
  { name: 'Browse by Account', href: '/team', icon: TableCellsIcon },
];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col">
        <header className="bg-black shadow">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-semibold text-white">▲vercel/feedback</h1>
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
              <div className="flex gap-4">
                <LogFeedbackDialog
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-x-2.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      Log Feedback
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 