import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/axios.ts";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination.tsx";
import { DataTableProvider } from "@/components/ui/data-table/data-table-provider.tsx";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar.tsx";
import { DataTable } from "@/components/ui/data-table/data-table.tsx";
import { ListingHeader } from "@/components/ui/listing.tsx";
import { useTableStates } from "@/hooks/useTableStates.ts";

import { Action, columns } from "../columns.tsx";

export function TeamListing() {
  const navigate = useNavigate();

  const { columnFilters, pagination, setColumnFilters, setPagination, setSorting, sorting } = useTableStates();

  const { isLoading, data: queryData } = useQuery({
    queryKey: ["team", pagination, sorting, columnFilters],
    queryFn: async () => {
      const name = columnFilters.find(({ id }) => id === "name")?.value;
      const res = await client.get("/api/teams", {
        params: {
          name,
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
      return {
        branch: res.data["data"],
        total: res.data["meta"]["total"],
      };
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <ListingHeader
        title="Teams"
        description="Manage your teams"
        onAddButtonClicked={() => navigate("/team/create?mode=create")}
        buttonLabel="Team"
      />
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={[
            ...columns,
            {
              id: "actions",
              cell: ({ row }) => <Action id={(row?.original as { id: "" })?.id || ""} />,
            },
          ]}
          tableSetting={{
            enableRowSelection: false,
            rowCount: queryData?.total,
            state: { columnFilters, pagination, sorting },
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
          }}
        >
          <DataTableToolbar searchBarColumn="name" searchBarPlaceholder="Search team name" />
          <DataTable />
          <DataTablePagination />
        </DataTableProvider>
      </div>
    </div>
  );
}
