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
import {DataTableColumnHeader} from "@/components/ui/data-table/data-table-column-header.tsx";

export function BranchListing() {
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
    queryKey: ["branch", pagination, sorting, columnFilters],
    queryFn: async () => {
      const name = columnFilters.find(({id}) => id === "name")?.value;
      const res = await client.get("/api/branches", {
        params: {
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
        title="Branches & Claims"
        description="Manage your branches and claim limits"
        onAddButtonClicked={() => navigate("/branch/create?mode=create")}
        buttonLabel="Branch"
      />
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={[
            ...columns,
            ...(queryData?.branch[0]?.claim_limits || [])?.map(
              ({claim_type_id, claim_type_name}, index) => ({
                id: `claim_type_${claim_type_id}`,
                enableSorting: false,
                header: ({column}) => (
                  <DataTableColumnHeader
                    column={column}
                    title={claim_type_name}
                  />
                ),
                cell: ({row}) => {
                  return (
                    <div className="flex space-x-2">
                      <span className="max-w-[500px] truncate font-medium">
                        {row.original.claim_limits[index]?.limit_amount}
                      </span>
                    </div>
                  );
                },
              })
            ),
            {
              accessorKey: "team",
              enableSorting: false,
              header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Team" />
              ),
              cell: ({ row }) => {
                return (
                  <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                      {row?.original?.team_name ?? ""}
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
            searchBarPlaceholder="Search branch name"
          />
          <DataTable />
          <DataTablePagination />
        </DataTableProvider>
      </div>
    </div>
  );
}
