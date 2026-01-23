import {Action, columns} from "../columns.tsx";
import {DataTable} from "@/components/ui/data-table/data-table.tsx";
import {DataTableToolbar} from "@/components/ui/data-table/data-table-toolbar.tsx";
import {useQuery} from "@tanstack/react-query";
import {useTableStates} from "@/hooks/useTableStates.ts";
import {DataTableProvider} from "@/components/ui/data-table/data-table-provider.tsx";
import {DataTablePagination} from "@/components/ui/data-table/data-table-pagination.tsx";
import {ListingHeader} from "@/components/ui/listing.tsx";
import {client} from "@/axios.ts";
import {useNavigate} from "react-router-dom";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";

export function WebsiteListing() {
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
    queryKey: ["website", pagination, sorting, columnFilters],
    queryFn: async () => {
      const name = columnFilters.find(({id}) => id === "name")?.value || '';
      const res = await client.get("/api/websites", {
        params: {
          name: name,
          search: name,
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
        title="Websites"
        description="Manage your websites"
        onAddButtonClicked={() => navigate("/website/create?mode=create")}
        buttonLabel="Website"
      />
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={[
            ...columns,
            {
              id: "url",
              accessorKey: "url",
              header: ({column}) => (
                <DataTableColumnHeader column={column} title="Website url" />
              ),
              cell: ({row}) => {
                return (
                  <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                      {row.getValue("url") || "-"}
                    </span>
                  </div>
                );
              },
            },
            {
              id: "default_limit",
              accessorKey: "default_limit",
              header: ({column}) => (
                <DataTableColumnHeader column={column} title="Default Limit" />
              ),
              cell: ({row}) => {
                return (
                  <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                      {row.getValue("default_limit") || "-"}
                    </span>
                  </div>
                );
              },
            },
            {
              id: "agency",
              accessorKey: "agency",
              header: ({column}) => (
                <DataTableColumnHeader column={column} title="Agency" />
              ),
              cell: ({row}) => {
                return (
                  <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                      {row?.original?.agency?.company_name || "-"}
                    </span>
                  </div>
                );
              },
            },
            {
              id: "actions",
              cell: ({row}) => (
                <Action id={(row?.original as {id: ""})?.id || ""} />
              ),
            },
          ]}
          tableSetting={{
            enableRowSelection: false,
            rowCount: queryData?.total,
            state: {columnFilters, pagination, sorting},
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
          }}
        >
          <DataTableToolbar
            searchBarColumn="name"
            searchBarPlaceholder="Search website name"
          />
          <DataTable />
          <DataTablePagination />
        </DataTableProvider>
      </div>
    </div>
  );
}
