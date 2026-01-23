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
import { yourClaims } from "@/modules/claim/user-claims-columns.tsx";

import { columns } from "../columns.tsx";

export function ClaimListing() {
  const [tabs, setTabs] = useState("leaves");
  const navigate = useNavigate();

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR, ROLES.BRANCH_MANAGER]}>
        <ListingHeader
          title="Claims Management"
          description="Manage your claims here."
          buttonLabel={"New Claims"}
          onAddButtonClicked={
            tabs !== "your-leaves"
              ? undefined
              : () => {
                  navigate("/claim/create");
                }
          }
        />
        <Tabs onValueChange={setTabs} value={tabs}>
          <TabsList>
            <TabsTrigger value="leaves">Approve Claims</TabsTrigger>
            <TabsTrigger value="your-leaves">Your Claims</TabsTrigger>
          </TabsList>
          <TabsContent value="leaves">
            <ApproveClaims />
          </TabsContent>
          <TabsContent value="your-leaves">
            <BranchClaimUtilisation />
            <YourClaims />
          </TabsContent>
        </Tabs>
      </CanAccess>
      <CanAccess roles={[ROLES.ENGINEER, ROLES.CREDIT_OFFICER]}>
        <ListingHeader
          title="Claims Management"
          description="Manage your claims here."
          buttonLabel={"New Claims"}
          onAddButtonClicked={() => navigate("/claim/create")}
        />
        <BranchClaimUtilisation />
        <YourClaims />
      </CanAccess>
    </div>
  );
}

export function ApproveClaims() {
  const { columnFilters, pagination, setColumnFilters, setPagination, setSorting, sorting } = useTableStates();

  const {
    isLoading,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["user-claims", pagination, sorting, columnFilters],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const search = columnFilters.find(({ id }) => id === "user_name")?.value;

      const res = await client.get("/api/user-claims", {
        params: {
          status: (columnFilters?.find(({ id }) => id === "status")?.value as string[])?.join(","),
          claim_type: (columnFilters?.find(({ id }) => id === "claim_type")?.value as string[])?.join(","),
          branch: (columnFilters?.find(({ id }) => id === "branch")?.value as number[])?.join(","),
          date: columnFilters?.find(({ id }) => id === "date")?.value,
          direction: "asc",
          sort: "status",
          page: pagination?.pageIndex + 1,
          search,
          ...sorting?.reduce((p, c) => {
            return {
              ...p,
              sort: { user_name: "user", approver_name: "approver" }[c?.id] ?? c?.id,
              direction: !c?.desc ? "asc" : "desc",
            };
          }, {}),
        },
      });

      return {
        branch: res?.data?.data,
        total: res.data["meta"]["total"],
      };
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

  const { data: claimTypeData } = useQuery({
    queryKey: ["claim-type", pagination, sorting, columnFilters],
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

      // Transform the data format
      const transformedData = res.data["data"].map((claimType) => ({
        label: claimType.name,
        value: claimType.id,
      }));

      return {
        claimType: transformedData,
      };
    },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <DataTableProvider
          data={queryData?.branch || []}
          isLoading={isLoading}
          columns={columns({ refetch })}
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
                key: "claim_type",
                title: "Claim Type",
                options: claimTypeData?.claimType || [],
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
    </div>
  );
}

export function YourClaims() {
  const { columnFilters, pagination, setColumnFilters, setPagination, setSorting, sorting } = useTableStates();
  const navigate = useNavigate();
  const [claimId, setClaimId] = useState("");
  const [claimStatus, setClaimStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { isLoading, data: queryData } = useQuery({
    queryKey: ["user-claims", pagination, sorting, columnFilters],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await client.get("/api/users/claims", {
        params: {
          status: (columnFilters?.find(({ id }) => id === "status")?.value as string[])?.join(","),
          direction: "asc",
          sort: "status",
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
        claims: res?.data?.data || [],
        total: res?.data?.meta?.total || res?.data?.total || 0,
      };
    },
  });

  const { mutateAsync: cancelClaim } = useMutation<void, unknown, { status: string }>({
    mutationKey: ["claimStatusUpdate"],
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated!",
        description: `Status has been updated to ${status}.`,
      });
      window.location.reload();
    },
    mutationFn: async ({ status }) => {
      return await client.patch(`/api/user-claims/${claimId}/cancel`, { status });
    },
  });

  const handleOpenChange = (action: string, status: string, id: string) => {
    setClaimStatus(status);
    setClaimId(id);
    if (action === "edit") {
      navigate(`/claim/create?mode=edit&id=${id}`);
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
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <div className="h-full flex-1 flex-col space-y-2 md:flex">
        <AlertDialog open={isOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm to cancel this claim?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => closeActionDialog()}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-700"
                onClick={() => {
                  if (claimStatus === CLAIM_STATUS.PENDING) {
                    cancelClaim({ status: CLAIM_STATUS.CANCELLED });
                  }
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DataTableProvider
          data={queryData?.claims || []}
          isLoading={isLoading}
          columns={yourClaims({ handleOpenChange })}
          tableSetting={{
            state: { columnFilters, pagination, sorting },
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange: setPagination,
            onSortingChange: setSorting,
            manualPagination: true,
            enableRowSelection: false,
            manualSorting: true,
            manualFiltering: true,
            rowCount: queryData?.total,
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
    </div>
  );
}
