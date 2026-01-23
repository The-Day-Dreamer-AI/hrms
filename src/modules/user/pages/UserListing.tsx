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
import BranchSelector from "@/components/branch-selector.tsx";
import {useState} from "react";

export function UserListing() {
  const navigate = useNavigate();
  const [branch, setBranch] = useState([]);

  const {
    columnFilters,
    pagination,
    setColumnFilters,
    setPagination,
    setSorting,
    sorting,
  } = useTableStates();

  const {isLoading, data: queryData} = useQuery({
    queryKey: ["users", pagination, sorting, columnFilters, branch],
    queryFn: async () => {
      const search = columnFilters.find(({id}) => id === "user_name")?.value;

      const res = await client.get("/api/users", {
        params: {
          branch_id: branch[0],
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
      return {
        total: res?.data?.total,
        branch: res?.data?.data,
      };
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <ListingHeader
        title="Users"
        description="Manage users in the system"
        onAddButtonClicked={() => navigate("/user/create?mode=create")}
        buttonLabel="Users"
      />
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={columns}
          tableSetting={{
            state: {columnFilters, pagination, sorting},
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
            enableRowSelection: false,
            rowCount: queryData?.total,
          }}
        >
          <DataTableToolbar
            searchBarColumn="user_name"
            searchBarPlaceholder="Search user name"
          />
          <div>
            <BranchSelector value={branch} onChange={setBranch} selectOne />
          </div>

          <DataTable />
          <DataTablePagination />
        </DataTableProvider>
      </div>
    </div>
  );
}
