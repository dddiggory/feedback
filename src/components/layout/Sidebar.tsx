"use client";

import { HomeIcon, ChartBarIcon, ChatBubbleLeftRightIcon, UserGroupIcon, ChatBubbleBottomCenterIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Submit Feedback', href: '/', icon: ChatBubbleBottomCenterIcon },
  { name: 'Analytics & Reporting', href: '/analytics', icon: ChartBarIcon },
  { name: 'Browse by Product Area', href: '/team', icon: TableCellsIcon },
  { name: 'Browse by Account', href: '/team', icon: TableCellsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Set initial state based on screen width
      const isLargeScreen = window.innerWidth >= 1024; // 1024px is the 'lg' breakpoint in Tailwind
      setIsCollapsed(!isLargeScreen);

      // Add resize listener
      const handleResize = () => {
        const isLargeScreen = window.innerWidth >= 1024;
        setIsCollapsed(!isLargeScreen);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const toggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(prev => !prev);
  };

  return (
    <div 
      className={clsx(
        "flex h-full flex-col bg-gray-900 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <span className={clsx(
          "text-xl font-semibold text-white transition-opacity duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          ▲vercel/feedback
        </span>
        <div className="relative z-10">
          <button
            type="button"
            onClick={toggleSidebar}
            className="relative p-1.5 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer select-none z-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={clsx(
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex gap-x-3 rounded-md text-sm font-semibold leading-6',
                        isCollapsed ? 'justify-center p-1' : 'p-2',
                        'mx-0 w-full'
                      )}
                      style={{ borderRadius: 8 }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      <span className={clsx(
                        "transition-opacity duration-300",
                        isCollapsed ? "hidden" : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
} 