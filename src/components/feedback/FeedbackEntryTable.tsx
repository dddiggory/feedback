"use client";

import { DataTable } from "../data-table/data-table";
import { DataTableToolbar } from "../data-table/data-table-toolbar";
import { DataTableAdvancedToolbar } from "../data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "../data-table/data-table-filter-list"; 
import { DataTableSortList } from "../data-table/data-table-sort-list";
import { useDataTable } from "@/hooks/use-data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export interface FeedbackEntry {
  id: string;
  feedback_item_id: string;
  account_name: string;
  entry_description: string;
  severity: string;
  current_arr: number;
  open_opp_arr: number;
  impacted_arr: number;
  created_by_user_id: string;
  created_at: string; // Note: This comes as a string from the database
}

// Define the column definitions
export const columns: ColumnDef<FeedbackEntry>[] = [
  {
    accessorKey: "account_name",
    header: "Account Name",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "entry_description",
    header: "Description",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const description = row.getValue("entry_description") as string;
      return (
        <div className="w-[30vw] max-h-[100px] overflow-y-auto whitespace-normal break-words">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
      return (
        <div className="capitalize">
          {severity}
        </div>
      );
    },
  },
  {
    accessorKey: "current_arr",
    header: "Current ARR",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const amount = row.getValue("current_arr") as number;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },
  {
    accessorKey: "open_opp_arr",
    header: "Open Opp ARR",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const amount = row.getValue("open_opp_arr") as number;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },
  {
    accessorKey: "impacted_arr",
    header: "Impacted ARR",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const amount = row.getValue("impacted_arr") as number;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },
  {
    accessorKey: "created_by_user_id",
    header: "Submitter",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "created_at",
    header: "Submit Date",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string);
      return format(date, "MMM d, yyyy");
    },
  },
];

interface FeedbackEntryTableProps {
  data: FeedbackEntry[];
  useAdvancedToolbar?: boolean;
}

export function FeedbackEntryTable({
  data,
  useAdvancedToolbar = false,
}: FeedbackEntryTableProps) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount: -1,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  // Debug: log the current filter value for 'account_name'
  console.log('Account Name filter value:', table.getColumn("account_name")?.getFilterValue());

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        {useAdvancedToolbar ? (
          <DataTableAdvancedToolbar table={table}>
            <input
              type="text"
              placeholder="Search account name..."
              className="input input-bordered w-full max-w-xs mb-2"
              value={String(table.getColumn("account_name")?.getFilterValue() ?? "")}
              onChange={e =>
                table.getColumn("account_name")?.setFilterValue(e.target.value)
              }
            />
            <DataTableFilterList table={table} />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}