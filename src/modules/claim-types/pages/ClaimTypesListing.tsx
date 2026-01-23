import {columns} from "../columns.tsx";
import {DataTable} from "@/components/ui/data-table/data-table.tsx";
import {DataTableToolbar} from "@/components/ui/data-table/data-table-toolbar.tsx";
import {useQuery} from "@tanstack/react-query";
import {useTableStates} from "@/hooks/useTableStates.ts";
import {DataTableProvider} from "@/components/ui/data-table/data-table-provider.tsx";
import {DataTablePagination} from "@/components/ui/data-table/data-table-pagination.tsx";
import {ListingHeader} from "@/components/ui/listing.tsx";
import {client} from "@/axios.ts";
import {useNavigate} from "react-router-dom";

export function ClaimTypesListing() {
    const navigate = useNavigate();

    const {
        columnFilters,
        pagination,
        setColumnFilters,
        setPagination,
        setSorting,
        sorting,
    } = useTableStates();

    const {isLoading, data: queryData} = useQuery({
        queryKey: ["claim-types", pagination, sorting],
        queryFn: async () => {
            const res = await client.get("/api/claim-types", {
                params: {
                    page: pagination?.pageIndex + 1,
                    ...sorting?.reduce((p, c) => {
                        return {
                            ...p,
                            sort: c?.id,
                            direction: !c?.desc ? "asc" : "desc",
                        };
                    }, {}),
                },
            });
            return res.data || [];
        },
    });

    return (
        <div className="h-full flex-1 flex-col space-y-4 md:flex">
            <ListingHeader
                title="Claims Types "
                description="Manage your claim types here."
                onAddButtonClicked={() => navigate("/claim-types/create?mode=create")}
                buttonLabel="Claim Types"
            />
            <div className="h-full flex-1 flex-col space-y-2 md:flex">
                <DataTableProvider
                    data={queryData?.data || []}
                    isLoading={isLoading}
                    columns={columns}
                    tableSetting={{
                        enableRowSelection: false,
                        state: {columnFilters, pagination, sorting},
                        onColumnFiltersChange: setColumnFilters,
                        onPaginationChange: setPagination,
                        onSortingChange: setSorting,
                    }}
                >
                    <DataTableToolbar
                        searchBarColumn="name"
                        searchBarPlaceholder="Search Claim Name"
                    />
                    <DataTable/>
                    <DataTablePagination/>
                </DataTableProvider>
            </div>
        </div>
    );
}
