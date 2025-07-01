'use client'

import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/client';
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import useSWR from 'swr';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DatabaseEntry {
  id: string;
  account_name: string | null;
  current_arr: number | null;
  open_opp_arr: number | null;
  created_at: string;
  company_website?: string | null;
  [key: string]: unknown;
}

interface AggregatedAccount {
  name: string;
  entries: DatabaseEntry[];
  currentARR: number;
  openOppARR: number;
  entryCount: number;
  lastActivity: string;
}

const fetcher = async () => {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DatabaseEntry[] | null };

  return entries || [];
};

function AccountsData() {
  const { data: entries, error, isLoading } = useSWR('accounts-entries', fetcher, {
    // Instant loading with cached data
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading accounts data</p>
      </div>
    );
  }

  if (isLoading || !entries) {
    return <AccountsDataSkeleton />;
  }

  // Group entries by account/customer
  const accountsMap = entries.reduce((acc: Record<string, AggregatedAccount>, entry: DatabaseEntry) => {
    const accountName = entry.account_name || 'Unknown Account';
    
    if (!acc[accountName]) {
      acc[accountName] = {
        name: accountName,
        entries: [],
        currentARR: 0,
        openOppARR: 0,
        entryCount: 0,
        lastActivity: entry.created_at
      };
    }
    
    acc[accountName].entries.push(entry);
    acc[accountName].currentARR += entry.current_arr || 0;
    acc[accountName].openOppARR += entry.open_opp_arr || 0;
    acc[accountName].entryCount += 1;
    
    // Update last activity if this entry is more recent
    if (new Date(entry.created_at) > new Date(acc[accountName].lastActivity)) {
      acc[accountName].lastActivity = entry.created_at;
    }
    
    return acc;
  }, {});

  const accounts: AggregatedAccount[] = Object.values(accountsMap).sort((a, b) => 
    b.entryCount - a.entryCount
  );

  // Calculate summary stats
  const totalAccounts = accounts.length;
  const totalEntries = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.entryCount, 0);
  const totalCurrentARR = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.currentARR, 0);
  const totalOpenOppARR = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.openOppARR, 0);

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Accounts
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalAccounts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Entries
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalEntries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current ARR
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(totalCurrentARR)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Opp ARR
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(totalOpenOppARR)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Accounts by Engagement */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Top Accounts by Engagement</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.slice(0, 6).map((account: AggregatedAccount) => {
              // Get company website from the first entry that has one
              const companyWebsite = account.entries.find(entry => entry.company_website)?.company_website;
              
              // Clean up the website URL for logo.dev (same logic as FeedbackEntriesTable)
              const cleanWebsite = companyWebsite 
                ? companyWebsite
                    .replace(/^https?:\/\//, '') // Remove protocol
                    .replace(/^www\./, '')       // Remove www prefix
                    .replace(/\/$/, '')          // Remove trailing slash
                    .split('/')[0]               // Remove path - keep only domain
                    .toLowerCase()               // Ensure lowercase
                : null;
              
              // Generate logo URL if company website is available
              const logoUrl = cleanWebsite 
                ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=48&format=webp`
                : null;

              const AccountCard = (
                <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {logoUrl ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <Image
                            src={logoUrl}
                            alt={`${account.name} logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                            unoptimized
                            onError={(e) => {
                              // Hide the image container if logo fails to load and show fallback
                              const target = e.target as HTMLElement;
                              const container = target.closest('div');
                              if (container) {
                                container.innerHTML = `<div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-lg font-medium">${account.name.charAt(0).toUpperCase()}</span></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-medium">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {account.entryCount} feedback entries
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current ARR</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(account.currentARR)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Open Opp ARR</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(account.openOppARR)}
                      </p>
                    </div>
                  </div>
                </div>
              );

              // If we have a clean website, make it a link, otherwise just show the card
              return cleanWebsite ? (
                <Link key={account.name} href={`/accounts/${cleanWebsite}`}>
                  {AccountCard}
                </Link>
              ) : (
                <div key={account.name}>
                  {AccountCard}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function AccountsDataSkeleton() {
  return (
    <>
      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Accounts Skeleton */}
      <div className="bg-white rounded-lg shadow animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AccountsContent() {
  return (
    <div className="space-y-8">
      {/* Header - Shows immediately */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse by Account</h1>
        <p className="mt-2 text-white">
          View accounts with feedback entries.
        </p>
      </div>

      {/* Data - Streams in after page loads */}
      <Suspense fallback={<AccountsDataSkeleton />}>
        <AccountsData />
      </Suspense>
    </div>
  );
} 