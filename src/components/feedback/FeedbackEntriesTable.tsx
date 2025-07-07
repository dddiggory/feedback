"use client";

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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye } from "lucide-react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/components/layout/UserContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { getSeverityStyle } from "@/lib/utils";
import { formatARR } from "@/lib/format";

interface FeedbackEntry {
  id: string;
  feedback_item_id: string;
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
  total_arr?: number;
  sfdc_account?: string | null;
  company_website?: string | null;
  entry_key?: string;
  external_links?: string | null;
}



interface FeedbackEntriesTableProps {
  data: FeedbackEntry[];
}

export function FeedbackEntriesTable({ data }: FeedbackEntriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const handleViewEntry = (entryKey: string) => {
    router.push(`${pathname}/entries/${entryKey}`);
  };

  const columns: ColumnDef<FeedbackEntry>[] = [
    {
      accessorKey: "account_name",
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
        const accountName = row.getValue("account_name") as string;
        const companyWebsite = row.original.company_website;
        
        // Clean up the website URL for logo.dev
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
          ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=26&format=webp`
          : null;

        // Debug logging
        if (companyWebsite) {
          console.log(`[${accountName}] Original website: "${companyWebsite}" -> Cleaned: "${cleanWebsite}" -> Logo URL: "${logoUrl}"`);
        }

        return (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="flex-shrink-0 w-7 h-7 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={`${accountName} logo`}
                  width={26}
                  height={26}
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    console.log(`[${accountName}] Logo failed to load: ${logoUrl}`);
                    // Hide the image container if logo fails to load
                    const target = e.target as HTMLElement;
                    const container = target.closest('div');
                    if (container) {
                      container.style.display = 'none';
                    }
                  }}
                  onLoad={() => {
                    console.log(`[${accountName}] Logo loaded successfully: ${logoUrl}`);
                  }}
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {accountName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {cleanWebsite ? (
              <Link 
                href={`/accounts/${cleanWebsite}`}
                className="font-medium text-slate-600 hover:text-blue-800 underline hover:underline"
              >
                {accountName}
              </Link>
            ) : (
              <div className="font-medium">{accountName}</div>
            )}
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
        const entry = row.original;
        
        // Check if current user is the submitter
        const isCurrentUserSubmitter = user && (
          (entry.created_by_user_id && entry.created_by_user_id === user.id) ||
          (entry.submitter_email && entry.submitter_email === user.email)
        );
        
        return (
          <div className="flex items-center gap-2 max-w-[300px]">
            <div 
              className="text-sm truncate flex-1 cursor-pointer hover:text-gray-700 hover:underline" 
              title={description}
              onClick={entryKey ? () => handleViewEntry(entryKey) : undefined}
            >
              {description}
            </div>
            {entryKey && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer h-6 w-6 p-0 flex-shrink-0 hover:bg-sky-100 outline-slate-300 outline"
                onClick={() => handleViewEntry(entryKey)}
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
      accessorKey: "severity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Severity
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
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
      accessorKey: "total_arr",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            ARR Impact
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.total_arr;
        return <div className="text-right font-medium">{formatARR(amount)}</div>;
      },
    },
    {
      accessorKey: "current_arr",
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
        const amount = row.getValue("current_arr") as number;
        return <div className="text-right font-medium">{formatARR(amount)}</div>;
      },
    },
    {
      accessorKey: "open_opp_arr",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Open ARR
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue("open_opp_arr") as number;
        return <div className="text-right font-medium">{formatARR(amount)}</div>;
      },
    },
    {
      accessorKey: "submitter_name",
      header: "Submitter",
      cell: ({ row }) => {
        const name = row.original.submitter_name || row.original.submitter_email || row.original.created_by_user_id;
        const userId = row.original.created_by_user_id;
        return userId ? (
          <a
            href={`/user/${userId}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {name}
          </a>
        ) : (
          <span>{name}</span>
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
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const entry = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hidden">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(entry.id)}
              >
                Copy entry ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit entry</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
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
            value={(table.getColumn("account_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("account_name")?.setFilterValue(event.target.value)
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
                    {column.id}
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