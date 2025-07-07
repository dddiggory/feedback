'use client'

import { createClient } from '@/lib/supabase/client';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import useSWR from 'swr';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  companyWebsite?: string | null;
}

// Helper function to format currency
function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || !isFinite(amount)) {
    return "$0";
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${Math.floor(amount / 1000)}k`;
  }
  return `$${amount}`;
}

const fetcher = async () => {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DatabaseEntry[] | null };

  return entries || [];
};

function AccountsTable({ accounts }: { accounts: AggregatedAccount[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "lastActivity", desc: true } // Sort by most recent by default
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<AggregatedAccount>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Account Name
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const account = row.original;
        const companyWebsite = account.companyWebsite;
        
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
          ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=32&format=webp`
          : null;

        return (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow hover:shadow-md transition-shadow">
                <Image
                  src={logoUrl}
                  alt={`${account.name} logo`}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    // Hide the image container if logo fails to load and show fallback
                    const target = e.target as HTMLElement;
                    const container = target.closest('div');
                    if (container) {
                      container.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shadow"><span class="text-gray-500 text-sm font-medium">${account.name.charAt(0).toUpperCase()}</span></div>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shadow">
                <span className="text-gray-500 text-sm font-medium">
                  {account.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {cleanWebsite ? (
              <Link 
                href={`/accounts/${cleanWebsite}`}
                className="font-medium text-slate-600 hover:text-blue-800 underline hover:underline"
              >
                {account.name}
              </Link>
            ) : (
              <div className="font-medium">{account.name}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "entryCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Entries
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = row.getValue("entryCount") as number;
        return <div className="text-center font-medium">{count}</div>;
      },
    },
    {
      accessorKey: "currentARR",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Current ARR
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue("currentARR") as number;
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "openOppARR",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Open Opp ARR
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue("openOppARR") as number;
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: "totalARR",
      accessorFn: (row) => row.currentARR + row.openOppARR,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Total ARR
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const account = row.original;
        const totalARR = account.currentARR + account.openOppARR;
        return <div className="text-right font-medium">{formatCurrency(totalARR)}</div>;
      },
    },
    {
      accessorKey: "lastActivity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Last Activity
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastActivity") as string);
        return <div className="text-center">{format(date, "MMM d, yyyy")}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: accounts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4 bg-white rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter accounts..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/([A-Z])/g, ' $1').trim()}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

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
        lastActivity: entry.created_at,
        companyWebsite: entry.company_website
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
    
    // Set company website if not already set and this entry has one
    if (!acc[accountName].companyWebsite && entry.company_website) {
      acc[accountName].companyWebsite = entry.company_website;
    }
    
    return acc;
  }, {});

  const accounts: AggregatedAccount[] = Object.values(accountsMap).sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return <AccountsTable accounts={accounts} />;
}

function AccountsDataSkeleton() {
  return (
    <div className="w-full space-y-4 bg-white rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
      
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export default function AccountsContent() {
  return (
    <div className="space-y-8">
      {/* Header - Shows immediately */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse by Account</h1>
        <p className="mt-2 text-white">
          View accounts with feedback entries. Click through to see all feedback from that Account.
        </p>
      </div>

      {/* Data - Streams in after page loads */}
      <Suspense fallback={<AccountsDataSkeleton />}>
        <AccountsData />
      </Suspense>
    </div>
  );
} 