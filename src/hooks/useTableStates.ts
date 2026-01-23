import * as React from "react";
import { ColumnFiltersState, SortingState, RowSelectionState } from "@tanstack/react-table";

export function useTableStates() {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        [],
    );
    const [rowSelection, setRowSelectionState] = React.useState<RowSelectionState>({})
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    return {
        setRowSelectionState,
        rowSelection,
        columnFilters,
        setColumnFilters,
        sorting,
        setSorting,
        pagination,
        setPagination
    }
}