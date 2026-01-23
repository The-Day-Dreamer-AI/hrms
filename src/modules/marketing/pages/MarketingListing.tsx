import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "@tanstack/react-query";

import { CanAccess, ROLES } from "@/acl.ts";
import { client } from "@/axios.ts";
import BranchClaimUtilisation from "@/components/branch-claim-utilisation.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { DataTableFilterBar } from "@/components/ui/data-table/data-table-filter-bar.tsx";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination.tsx";
import { DataTableProvider } from "@/components/ui/data-table/data-table-provider.tsx";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar.tsx";
import { DataTable } from "@/components/ui/data-table/data-table.tsx";
import { ListingHeader } from "@/components/ui/listing.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { toast } from "@/components/ui/use-toast";
import { ACTION_STATUS, CLAIM_STATUS, statusSelections } from "@/constants.ts";
import { useTableStates } from "@/hooks/useTableStates.ts";

import { columns } from "../columns.tsx";
import { userColumns } from "../user-marketing-claims-columns.tsx";

export function MarketingListing() {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState("admin");

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <div className="h-full flex-1 flex-col space-y-4 md:flex">
        <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR, ROLES.BRANCH_MANAGER]}>
          <ListingHeader
            description="Manage your marketing claims here."
            buttonLabel="marketing claims"
            title="Marketing Claims"
            onAddButtonClicked={tabs !== "you" ? undefined : () => navigate("/marketing/create")}
          />
          <Tabs onValueChange={setTabs} value={tabs}>
            <TabsList>
              <TabsTrigger value="admin">Approve claims</TabsTrigger>
              <TabsTrigger value="you">Your claims</TabsTrigger>
            </TabsList>
            <TabsContent value="admin">
              <AdminListing />
            </TabsContent>
            <TabsContent value="you">
              <BranchClaimUtilisation showMarketingClaims />
              <YourListing />
            </TabsContent>
          </Tabs>
        </CanAccess>
        <CanAccess roles={[ROLES.ENGINEER, ROLES.CREDIT_OFFICER]}>
          <ListingHeader
            description="Manage your marketing claims here."
            buttonLabel="marketing claims"
            title="Marketing Claims"
            onAddButtonClicked={() => navigate("/marketing/create")}
          />
          <BranchClaimUtilisation showMarketingClaims />
          <YourListing />
        </CanAccess>
      </div>
    </div>
  );
}

function AdminListing() {
  const { columnFilters, pagination, setColumnFilters, setPagination, setSorting, sorting } = useTableStates();

  const {
    isLoading,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["marketing_claims", pagination, sorting, columnFilters],
    queryFn: async () => {
      const search = columnFilters.find(({ id }) => id === "user_name")?.value;

      const res = await client.get("/api/user-marketing-claims", {
        params: {
          status: (columnFilters?.find(({ id }) => id === "status")?.value as string[])?.join(","),
          marketing_claim_type: (
            columnFilters?.find(({ id }) => id === "marketing_claim_type")?.value as string[]
          )?.join(","),
          branch: (columnFilters?.find(({ id }) => id === "branch")?.value as number[])?.join(","),
          date: columnFilters?.find(({ id }) => id === "date")?.value,
          direction: "asc",
          sort: "status",
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

      return { branch: res?.data?.data };
    },
  });

  const { data: branchData } = useQuery({
    queryKey: ["branch", pagination, sorting, columnFilters],
    queryFn: async () => {
      const res = await client.get("/api/branches", {
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

      // Transform the data format
      const transformedData = res.data["data"].map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));

      return {
        branch: transformedData,
        total: res.data["meta"]["total"],
      };
    },
  });

  const { data: marketingClaimTypeData } = useQuery({
    queryKey: ["marketing-claim-type", pagination, sorting, columnFilters],
    queryFn: async () => {
      const res = await client.get("/api/marketing-claim-types", {
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

      // Transform the data format
      const transformedData = res.data["data"].map((marketingClaimType) => ({
        label: marketingClaimType.name,
        value: marketingClaimType.id,
      }));

      return {
        claimType: transformedData,
      };
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-2 md:flex">
      <DataTableProvider
        data={queryData?.branch || []}
        isLoading={isLoading}
        columns={columns({ refetch })}
        tableSetting={{
          state: { columnFilters, pagination, sorting },
          onColumnFiltersChange: setColumnFilters,
          onPaginationChange: setPagination,
          onSortingChange: setSorting,
          manualPagination: true,
          enableRowSelection: false,
          manualSorting: true,
          manualFiltering: true,
        }}
      >
        <DataTableToolbar searchBarColumn="user_name" searchBarPlaceholder="Search user name" />
        <DataTableFilterBar
          filters={[
            {
              radio: true,
              key: "status",
              title: "Status",
              options: statusSelections,
            },
            {
              radio: true,
              key: "marketing_claim_type",
              title: "Marketing Claim Type",
              options: marketingClaimTypeData?.claimType || [],
            },
            {
              radio: true,
              key: "branch",
              title: "Branch",
              options: branchData?.branch || [],
            },
            {
              datePicker: true,
              isDateRange: false,
              key: "date",
              title: "Leave Date",
              options: [],
            },
          ]}
        />
        <DataTable />
        <DataTablePagination />
      </DataTableProvider>
    </div>
  );
}

function YourListing() {
  const { columnFilters, pagination, setColumnFilters, setSorting, sorting } = useTableStates();
  const [claimId, setClaimId] = useState("");
  const [claimStatus, setClaimStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoading, data: queryData } = useQuery({
    gcTime: 0,
    queryKey: ["your_marketing_claims", pagination, sorting, columnFilters],
    queryFn: async () => {
      const res = await client.get("/api/users/marketings", {
        params: {
          status: (columnFilters?.find(({ id }) => id === "status")?.value as string[])?.join(","),
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
      return { branch: res?.data?.data };
    },
  });

  const { mutateAsync: cancelMarketingClaim } = useMutation<void, unknown, { status: string }>({
    mutationKey: ["leaveStatusUpdate"],
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated!",
        description: `Status has been updated to ${status}.`,
      });
      window.location.reload();
    },
    mutationFn: async ({ status }) => {
      return await client.patch(`/api/user-marketing-claims/${claimId}/cancel`, { status });
    },
  });

  const handleOpenChange = (action: string, status: string, id: string) => {
    setClaimStatus(status);
    setClaimId(id);
    if (action === "edit") {
      navigate(`/marketing/create?mode=edit&id=${id}`);
      return;
    }

    if (action === ACTION_STATUS.CANCEL && status === CLAIM_STATUS.PENDING) {
      setIsOpen(!isOpen);
    }
  };

  const closeActionDialog = () => {
    setIsOpen(false);
  };
  return (
    <div className="h-full flex-1 flex-col space-y-2 md:flex">
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to cancel this marketing claim?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => closeActionDialog()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700"
              onClick={() => {
                if (claimStatus === CLAIM_STATUS.PENDING) {
                  cancelMarketingClaim({ status: CLAIM_STATUS.CANCELLED });
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DataTableProvider
        data={queryData?.branch || []}
        isLoading={isLoading}
        columns={userColumns({ handleOpenChange })}
        tableSetting={{
          state: { columnFilters, sorting },
          onColumnFiltersChange: setColumnFilters,
          onSortingChange: setSorting,
          enableRowSelection: false,
          manualSorting: true,
          manualFiltering: true,
        }}
      >
        <DataTableFilterBar
          filters={[
            {
              radio: true,
              key: "status",
              title: "Status",
              options: statusSelections,
            },
          ]}
        />
        <DataTable />
        <DataTablePagination />
      </DataTableProvider>
    </div>
  );
}
