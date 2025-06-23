import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface DatabaseEntry {
  id: string;
  account_name: string | null;
  current_arr: number | null;
  open_opp_arr: number | null;
  created_at: string;
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

export default async function AccountsPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DatabaseEntry[] | null };

  // Group entries by account/customer
  const accountsMap = entries?.reduce((acc: Record<string, AggregatedAccount>, entry: DatabaseEntry) => {
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
  }, {}) || {};

  const accounts: AggregatedAccount[] = Object.values(accountsMap).sort((a, b) => 
    b.entryCount - a.entryCount
  );

  // Calculate summary stats
  const totalAccounts = accounts.length;
  const totalEntries = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.entryCount, 0);
  const totalCurrentARR = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.currentARR, 0);
  const totalOpenOppARR = accounts.reduce((sum: number, acc: AggregatedAccount) => sum + acc.openOppARR, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse by Account</h1>
          <p className="mt-2 text-gray-600">
            View feedback entries organized by customer accounts
          </p>
        </div>

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
              {accounts.slice(0, 6).map((account: AggregatedAccount) => (
                <div
                  key={account.name}
                  className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
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
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Last activity: {new Date(account.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Accounts Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">All Accounts</h2>
            {accounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Account Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Entries
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Current ARR
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Open Opp ARR
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Revenue Impact
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accounts.map((account: AggregatedAccount) => (
                      <tr key={account.name} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                              <BuildingOfficeIcon className="h-4 w-4 text-white" />
                            </div>
                            {account.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {account.entryCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(account.currentARR)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(account.openOppARR)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(account.currentARR + account.openOppARR)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(account.lastActivity).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No customer accounts have provided feedback yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 