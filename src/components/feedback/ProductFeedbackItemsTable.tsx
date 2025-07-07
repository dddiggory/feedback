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
import { ArrowUpDown, ChevronDown, FileTextIcon } from "lucide-react";
import Link from 'next/link';
import { format } from "date-fns";
import { formatARR } from "@/lib/format";

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
import { getStatusStyle } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  product_area_names: string[] | null;
  current_arr_sum: number | null;
  open_opp_arr_sum: number | null;
  entry_count: number | null;
  created_at: string;
  updated_at: string;
}

interface ProductFeedbackItemsTableProps {
  data: FeedbackItem[];
}

export function ProductFeedbackItemsTable({ data }: ProductFeedbackItemsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updated_at", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    created_at: false,
    updated_at: false,
    description: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<FeedbackItem>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Title
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const slug = row.original.slug;
        return (
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Link 
              href={`/feedback/${slug}`}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] truncate"
              title={title}
            >
              {title}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div 
            className="text-sm text-gray-700 max-w-[200px] sm:max-w-[300px] lg:max-w-[400px] truncate"
            title={description}
          >
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "product_area_names",
      header: "Product Areas",
      cell: ({ row }) => {
        const areas = row.getValue("product_area_names") as string[] | null;
        return (
          <div className="flex flex-wrap gap-1">
            {areas?.map((area, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {area}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "entry_count",
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
        const count = row.getValue("entry_count") as number;
        return <div className="text-center font-medium text-gray-900">{count || 0}</div>;
      },
    },
    {
      accessorKey: "current_arr_sum",
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
        const amount = row.getValue("current_arr_sum") as number;
        return <div className="text-right font-medium text-gray-900">{formatARR(amount || 0)}</div>;
      },
    },
    {
      accessorKey: "open_opp_arr_sum",
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
        const amount = row.getValue("open_opp_arr_sum") as number;
        return <div className="text-right font-medium text-gray-900">{formatARR(amount || 0)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Status
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        


        return (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
              {status.replace('_', ' ')}
            </span>
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
            Created
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return <div className="text-sm text-gray-500">{format(date, "MMM d, yyyy")}</div>;
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Updated
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at") as string);
        return <div className="text-sm text-gray-500">{format(date, "MMM d, yyyy")}</div>;
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
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Input
            placeholder="Filter by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="w-32 sm:w-48 text-gray-900 flex-shrink-0"
          />
          <Input
            placeholder="Filter by description..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="w-32 sm:w-48 text-gray-900 flex-shrink-0"
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
                    {column.id === "entry_count" ? "Entries" :
                     column.id === "current_arr_sum" ? "Current ARR" :
                     column.id === "open_opp_arr_sum" ? "Open Opp ARR" :
                     column.id === "product_area_names" ? "Product Areas" :
                     column.id === "created_at" ? "Created" :
                     column.id === "updated_at" ? "Updated" :
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border">
        <Table className="min-w-[320px]">
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