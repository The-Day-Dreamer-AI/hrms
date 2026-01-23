import * as React from "react";
import {
    ColumnDef,
    VisibilityState,
    Table as TanStackTable,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    TableOptions,
} from "@tanstack/react-table";

interface DataTableProviderProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    FilterBar?: ({table}: { table: TanStackTable<TData> }) => JSX.Element;
    Toolbar?: ({table}: { table: TanStackTable<TData> }) => JSX.Element;
    isLoading?: boolean;
    data: TData[];
    tableSetting?: Partial<TableOptions<TData>>;
}

type DataTableContextType<TData, TValue> = DataTableProviderProps<
    TData,
    TValue
> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: TanStackTable<TData>;
};

export const DataTableContext = React.createContext<DataTableContextType<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
> | null>(null);

export function useDataTable<TData, TValue>() {
    return React.useContext(DataTableContext) as DataTableContextType<
        TData,
        TValue
    >;
}

export function DataTableProvider<TData, TValue>({
                                                     isLoading = false,
                                                     tableSetting,
                                                     children,
                                                     columns,
                                                     data,
                                                 }: DataTableProviderProps<TData, TValue> & {
    children: React.ReactNode
}) {
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        ...(tableSetting || {}),
        state: {
            columnVisibility,
            rowSelection,
            ...(tableSetting?.state || {}),
        },
    });
    
    return (
        <DataTableContext.Provider
            value={{table, isLoading, tableSetting, columns, data}}
        >
            {children}
        </DataTableContext.Provider>
    );
}
