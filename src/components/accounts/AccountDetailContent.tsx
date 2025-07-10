'use client'

import { createClient } from '@/lib/supabase/client';
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
import { ArrowUpDown, ChevronDown, Eye, ExternalLink } from 'lucide-react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/layout/UserContext";

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
import { getRandomGradient } from '@/lib/colors';
import { getSeverityStyle } from '@/lib/utils';
import { formatARR } from '@/lib/format';

interface FeedbackEntry {
  id: string;
  feedback_item_id: string;
  feedback_item_title?: string;
  feedback_item_slug?: string;
  product_area_names?: string[] | null;
  account_name: string;
  entry_description: string;
  severity: string;
  current_arr: number;
  open_opp_arr: number;
  impacted_arr: number;
  created_by_user_id: string;
  created_at: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_avatar?: string;
  total_arr?: number;
  sfdc_account?: string | null;
  company_website?: string | null;
  entry_key?: string;
  external_links?: string | null;
}

interface AccountSummary {
  name: string;
  cleanWebsite: string;
  currentARR: number;
  openOppARR: number;
  totalARR: number;
  entryCount: number;
  sfdcAccount?: string | null;
  companyWebsite?: string | null;
  lastActivity: string;
}



// Helper function to reconstruct account name from slug
function reconstructAccountNameFromSlug(slug: string): string {
  // This is a best-effort reconstruction - in a real app, you might want to store this mapping
  return slug.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const fetcher = async (slug: string) => {
  const supabase = createClient();
  
  // Get all entries with feedback item data and filter by the website slug
  const { data: entries } = await supabase
    .from('entries_with_data')
    .select('*')
    .order('created_at', { ascending: false }) as { data: FeedbackEntry[] | null };

  if (!entries) return { accountSummary: null, entries: [] };

  // Filter entries that match this account's website
  const filteredEntries = entries.filter(entry => {
    if (!entry.company_website) return false;
    
    const cleanWebsite = entry.company_website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0]
      .toLowerCase();
    
    return cleanWebsite === slug;
  });

  // If no entries found, try to match by account name as fallback
  if (filteredEntries.length === 0) {
    const reconstructedName = reconstructAccountNameFromSlug(slug);
    const nameMatchedEntries = entries.filter(entry => 
      entry.account_name?.toLowerCase().includes(reconstructedName.toLowerCase())
    );
    filteredEntries.push(...nameMatchedEntries);
  }

  if (filteredEntries.length === 0) {
    return { accountSummary: null, entries: [] };
  }

  // Create account summary
  const accountSummary: AccountSummary = {
    name: filteredEntries[0].account_name || reconstructAccountNameFromSlug(slug),
    cleanWebsite: slug,
    currentARR: filteredEntries.reduce((sum, entry) => sum + (entry.current_arr || 0), 0),
    openOppARR: filteredEntries.reduce((sum, entry) => sum + (entry.open_opp_arr || 0), 0),
    totalARR: 0, // Will be calculated
    entryCount: filteredEntries.length,
    sfdcAccount: filteredEntries.find(entry => entry.sfdc_account)?.sfdc_account || null,
    companyWebsite: filteredEntries.find(entry => entry.company_website)?.company_website || null,
    lastActivity: filteredEntries[0].created_at, // Already sorted by created_at desc
  };

  accountSummary.totalARR = accountSummary.currentARR + accountSummary.openOppARR;

  return { accountSummary, entries: filteredEntries };
};

function AccountFeedbackTable({ entries }: { entries: FeedbackEntry[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const router = useRouter();
  const { user } = useUser();

  const handleViewEntry = (entryKey: string, feedbackItemSlug?: string) => {
    if (feedbackItemSlug) {
      router.push(`/feedback/${feedbackItemSlug}/entries/${entryKey}`);
    } else {
      // Fallback if no feedback item slug is available
      router.push(`/feedback/entries/${entryKey}`);
    }
  };

  const columns: ColumnDef<FeedbackEntry>[] = [
    {
      accessorKey: "feedback_item_title",
      header: "Feedback Item",
      cell: ({ row }) => {
        const title = row.original.feedback_item_title;
        const slug = row.original.feedback_item_slug;
        
        return slug ? (
          <Link 
            href={`/feedback/${slug}`}
            className="font-medium text-blue-600 hover:text-blue-800 underline hover:underline max-w-[250px] block"
            title={title}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}
          >
            {title}
          </Link>
        ) : (
          <div 
            className="font-medium max-w-[250px]" 
            title={title}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}
          >
            {title}
          </div>
        );
      },
    },
    {
      accessorKey: "entry_description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("entry_description") as string;
        const entryKey = row.original.entry_key;
        const feedbackItemSlug = row.original.feedback_item_slug;
        const entry = row.original;
        
        const isCurrentUserSubmitter = user && (
          (entry.created_by_user_id && entry.created_by_user_id === user.id) ||
          (entry.submitter_email && entry.submitter_email === user.email)
        );
        
        return (
          <div className="flex items-start gap-2 max-w-[350px]">
            <div 
              className="text-sm flex-1 cursor-pointer hover:text-gray-700 hover:underline" 
              title={description}
              onClick={entryKey ? () => handleViewEntry(entryKey, feedbackItemSlug) : undefined}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                lineHeight: '1.4'
              }}
            >
              {description}
            </div>
            {entryKey && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer h-6 w-6 p-0 flex-shrink-0 hover:bg-sky-100 outline-slate-300 outline mt-0.5"
                onClick={() => handleViewEntry(entryKey, feedbackItemSlug)}
              >
                {isCurrentUserSubmitter ? (
                  <PencilSquareIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "product_area_names",
      header: "Product Areas",
      cell: ({ row }) => {
        const areas = row.original.product_area_names;
        
        if (!areas || areas.length === 0) {
          return <div className="text-gray-400 text-xs">No areas</div>;
        }
        
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {areas.slice(0, 3).map((area: string) => (
              <span
                key={area}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRandomGradient()} text-gray-800`}
              >
                {area}
              </span>
            ))}
            {areas.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{areas.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "severity",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2"
            >
              Severity
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        


        return (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityStyle(severity)}`}>
              {severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "submitter_name",
      header: "Submitter",
      cell: ({ row }) => {
        const name = row.original.submitter_name || row.original.submitter_email || row.original.created_by_user_id;
        const id = row.original.created_by_user_id;
        const avatar = row.original.submitter_avatar;
        
        // Generate avatar URL or fallback
        const avatarElement = avatar ? (
          <Image
            src={avatar}
            alt={`${name} avatar`}
            width={24}
            height={24}
            className="rounded-full object-cover"
            unoptimized
            onError={(e) => {
              // Fallback to initials if avatar fails to load
              const target = e.target as HTMLElement;
              const container = target.closest('div');
              if (container) {
                container.innerHTML = `<div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"><span class="text-xs font-medium text-gray-600">${(name || 'U').charAt(0).toUpperCase()}</span></div>`;
              }
            }}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {(name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        );

        return (
          <div className="flex items-center gap-2">
            {avatarElement}
            {id ? (
              <a
                href={`/user/${id}`}
                className="text-blue-600 hover:text-blue-800 underline truncate max-w-[150px]"
                title={name}
              >
                {name}
              </a>
            ) : (
              <span className="truncate max-w-[150px]" title={name}>{name}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Submit Date
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return <div>{format(date, "MMM d, yyyy")}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: entries,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) => {
      // Filter by both feedback item title and description
      const title = row.original.feedback_item_title?.toLowerCase() || '';
      const description = row.original.entry_description?.toLowerCase() || '';
      const searchValue = value.toLowerCase();
      
      return title.includes(searchValue) || description.includes(searchValue);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full space-y-4 bg-white rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by feedback item or description..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
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
        <Table style={{ tableLayout: 'fixed' }}>
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
                    <TableCell key={cell.id} style={{ whiteSpace: 'normal', wordWrap: 'break-word', verticalAlign: 'top' }}>
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
                  No feedback entries found for this account.
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

function AccountDetailData({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR(`account-detail-${slug}`, () => fetcher(slug), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading account data</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <AccountDetailSkeleton />;
  }

  const { accountSummary, entries } = data;

  if (!accountSummary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Account not found</p>
      </div>
    );
  }

  const logoUrl = `https://img.logo.dev/${accountSummary.cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=96&format=webp`;

  return (
    <div className="space-y-8">
      {/* Account Header */}
      <div className="bg-white rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Image
                src={logoUrl}
                alt={`${accountSummary.name} logo`}
                width={96}
                height={96}
                className="object-contain"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  const container = target.closest('div');
                  if (container) {
                    container.innerHTML = `<div class="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center shadow-lg"><span class="text-gray-500 text-2xl font-bold">${accountSummary.name.charAt(0).toUpperCase()}</span></div>`;
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{accountSummary.name}</h1>
              {accountSummary.companyWebsite && (
                <a
                  href={accountSummary.companyWebsite.startsWith('http') ? accountSummary.companyWebsite : `https://${accountSummary.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Feedback Entries</p>
                <p className="text-2xl font-bold text-gray-900">{accountSummary.entryCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current ARR</p>
                <p className="text-2xl font-bold text-gray-900">{formatARR(accountSummary.currentARR)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Open Opp ARR</p>
                <p className="text-2xl font-bold text-gray-900">{formatARR(accountSummary.openOppARR)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total ARR Exposure</p>
                <p className="text-2xl font-bold text-gray-900">{formatARR(accountSummary.totalARR)}</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Last Feedback Entry</p>
                <p className="text-lg font-medium text-gray-900">{format(new Date(accountSummary.lastActivity), "MMM d, yyyy")}</p>
              </div>
              {accountSummary.sfdcAccount && (
                <div>
                  <p className="text-sm text-gray-500">Salesforce Account</p>
                  <a
                    href={`${accountSummary.sfdcAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    View in Salesforce
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <AccountFeedbackTable entries={entries} />
      </div>
    </div>
  );
}

function AccountDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Account Header Skeleton */}
      <div className="bg-white rounded-xl p-8 animate-pulse">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="w-full space-y-4 bg-white rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="h-8 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccountDetailContentProps {
  slug: string;
}

export function AccountDetailContent({ slug }: AccountDetailContentProps) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<AccountDetailSkeleton />}>
        <AccountDetailData slug={slug} />
      </Suspense>
    </div>
  );
} 