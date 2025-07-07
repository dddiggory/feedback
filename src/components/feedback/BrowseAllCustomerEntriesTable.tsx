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
import { ArrowUpDown, ChevronDown, Eye } from "lucide-react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
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
import { getSeverityStyle } from "@/lib/utils";
import { formatARR } from "@/lib/format";

interface BrowseAllCustomerEntry {
  id: string;
  feedback_item_id: string;
  feedback_item_title?: string;
  feedback_item_slug?: string;
  account_name: string;
  entry_description: string;
  severity: string;
  current_arr: number;
  open_opp_arr: number;
  impacted_arr: number;
  total_arr: number;
  created_by_user_id: string;
  created_at: string;
  submitter_name?: string;
  submitter_email?: string;
  sfdc_account?: string | null;
  company_website?: string | null;
  entry_key?: string;
  external_links?: string | null;
}



interface BrowseAllCustomerEntriesTableProps {
  data: BrowseAllCustomerEntry[];
}

export function BrowseAllCustomerEntriesTable({ data }: BrowseAllCustomerEntriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    open_opp_arr: false,
    current_arr: false,
    submitter_name: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const router = useRouter();
  const { user } = useUser();

  const handleViewEntry = (entryKey: string, feedbackItemSlug?: string) => {
    if (feedbackItemSlug && entryKey) {
      router.push(`/feedback/${feedbackItemSlug}/entries/${entryKey}`);
    }
  };

  const columns: ColumnDef<BrowseAllCustomerEntry>[] = [
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
                    // Hide the image container if logo fails to load
                    const target = e.target as HTMLElement;
                    const container = target.closest('div');
                    if (container) {
                      container.style.display = 'none';
                    }
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
              <div className="font-medium text-gray-900">{accountName}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "feedback_item_title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Feedback Item
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("feedback_item_title") as string;
        const slug = row.original.feedback_item_slug;
        return slug ? (
          <Link 
            href={`/feedback/${slug}`}
            className="text-blue-600 hover:text-blue-800 underline max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] truncate block"
            title={title}
          >
            {title}
          </Link>
        ) : (
          <div className="max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] truncate" title={title}>
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
        
        // Check if current user is the submitter
        const isCurrentUserSubmitter = user && (
          (entry.created_by_user_id && entry.created_by_user_id === user.id) ||
          (entry.submitter_email && entry.submitter_email === user.email)
        );
        
        return (
          <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[280px] lg:max-w-[350px]">
            <div 
              className="text-sm truncate flex-1 cursor-pointer text-gray-900 hover:text-gray-700 hover:underline" 
              title={description}
              onClick={entryKey ? () => handleViewEntry(entryKey, feedbackItemSlug) : undefined}
            >
              {description}
            </div>
            {entryKey && feedbackItemSlug && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer h-6 w-6 p-0 flex-shrink-0 hover:bg-sky-100 outline-slate-300 outline"
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
            Total ARR
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.total_arr;
        return <div className="text-right font-medium text-gray-900">{formatARR(amount)}</div>;
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
        return <div className="text-right font-medium text-gray-900">{formatARR(amount)}</div>;
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
        return <div className="text-right font-medium text-gray-900">{formatARR(amount)}</div>;
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
          <span className="text-gray-900">{name}</span>
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
        return <div className="text-gray-900">{format(date, "MMM d, yyyy")}</div>;
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
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full max-w-full min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-x-auto">
          <Input
            placeholder="Filter by account..."
            value={(table.getColumn("account_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("account_name")?.setFilterValue(event.target.value)
            }
            className="w-28 sm:w-45 text-gray-900 flex-shrink-0"
          />
          <Input
            placeholder="Filter by request name..."
            value={(table.getColumn("feedback_item_title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("feedback_item_title")?.setFilterValue(event.target.value)
            }
            className="w-28 sm:w-45 text-gray-900 flex-shrink-0"
          />
          <Input
            placeholder="Filter by description..."
            value={(table.getColumn("entry_description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("entry_description")?.setFilterValue(event.target.value)
            }
            className="w-28 sm:w-45 text-gray-900 flex-shrink-0"
          />
          
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-gray-900 flex-shrink-0">
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
                    {column.id === "account_name" ? "Account Name" :
                     column.id === "feedback_item_title" ? "Feedback Item" :
                     column.id === "entry_description" ? "Description" :
                     column.id === "total_arr" ? "Total ARR" :
                     column.id === "current_arr" ? "Current ARR" :
                     column.id === "open_opp_arr" ? "Open ARR" :
                     column.id === "submitter_name" ? "Submitter" :
                     column.id === "created_at" ? "Submit Date" :
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border">
        <Table className="min-w-[450px]">
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
            className="text-gray-900"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-900"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 