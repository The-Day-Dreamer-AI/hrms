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

export function AgencyListing() {
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
    queryKey: ["agencies", pagination, sorting, columnFilters],
    queryFn: async () => {
      const search = columnFilters.find(({id}) => id === "company_name")?.value;
      const res = await client.get("/api/agencies", {
        params: {
          page: pagination?.pageIndex + 1,
          search,
          ...sorting?.reduce((p, c) => {
            return {
              ...p,
              sort: c?.id,
              direction: !c?.desc ? "asc" : "desc",
            };
          }, {}),
        },
      });

      return {branch: res.data.data, total: res.data.total};
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <ListingHeader
        title="Marketing Agencies"
        description="Manage your branches and claim limits"
        onAddButtonClicked={() => navigate("/agency/create?mode=create")}
        buttonLabel="agency"
      />
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={columns}
          tableSetting={{
            enableRowSelection: false,
            state: {columnFilters, pagination, sorting},
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            manualSorting: true,
            manualPagination: true,
            manualFiltering: true,
            rowCount: queryData?.total,
          }}
        >
          <DataTableToolbar
            searchBarColumn="company_name"
            searchBarPlaceholder="Search agency name"
          />
          <DataTable />
          <DataTablePagination />
        </DataTableProvider>
      </div>
    </div>
  );
}
