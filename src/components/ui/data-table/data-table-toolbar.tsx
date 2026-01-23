"use client";

import { useDebounceCallback } from "usehooks-ts";

import { Input } from "@/components/ui/input.tsx";

import { useDataTable } from "./data-table-provider";

interface DataTableToolbarProps {
  searchBarColumn?: string;
  searchBarPlaceholder?: string;
}

export function DataTableToolbar<TData, TValue>({ searchBarColumn, searchBarPlaceholder }: DataTableToolbarProps) {
  const { table } = useDataTable<TData, TValue>();

  const debounced = useDebounceCallback(
    (value) => (value.length >= 3 || value.length == 0 ? table.getColumn(searchBarColumn).setFilterValue(value) : ""),
    500,
  );

  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder={searchBarPlaceholder ?? "Search"}
        onChange={(event) => debounced(event.target.value)}
        className="h-10 w-full lg:w-[250px]"
        defaultValue={(table.getColumn(searchBarColumn).getFilterValue() as string) ?? ""}
      />
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  );
}
