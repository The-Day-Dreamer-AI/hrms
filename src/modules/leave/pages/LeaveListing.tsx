import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "@tanstack/react-query";

import { CanAccess, ROLES } from "@/acl.ts";
import { client } from "@/axios.ts";
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
import { Card } from "@/components/ui/card.tsx";
import { DataTableFilterBar } from "@/components/ui/data-table/data-table-filter-bar.tsx";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination.tsx";
import { DataTableProvider } from "@/components/ui/data-table/data-table-provider.tsx";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar.tsx";
import { DataTable } from "@/components/ui/data-table/data-table.tsx";
import { ListingHeader } from "@/components/ui/listing.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { toast } from "@/components/ui/use-toast";
import { LeaveStatusOptions, STATUS } from "@/constants.ts";
import { useTableStates } from "@/hooks/useTableStates.ts";
import { LeaveTypes } from "@/modules/leave/constants.ts";
import { yourLeave } from "@/modules/leave/user-leaves-columns.tsx";

import { approveLeave } from "../columns.tsx";

export function LeaveListing() {
  const [tabs, setTabs] = useState("leaves");
  const navigate = useNavigate();

  return (
    <div className="h-full flex-1 flex-col space-y-4 md:flex">
      <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR, ROLES.BRANCH_MANAGER]}>
        <ListingHeader
          title="Leave Management"
          description="Manage your leaves here."
          buttonLabel={"New Leave"}
          onAddButtonClicked={
            tabs !== "your-leaves"
              ? undefined
              : () => {
                  navigate("/leave/create");
                }
          }
        />
        <Tabs onValueChange={setTabs} value={tabs}>
          <TabsList>
            <TabsTrigger value="leaves">Approve Leaves</TabsTrigger>
            <TabsTrigger value="your-leaves">Your Leaves</TabsTrigger>
          </TabsList>
          <TabsContent value="leaves">
            <ApproveLeaves setTabs={setTabs} />
          </TabsContent>
          <TabsContent value="your-leaves">
            <YourLeaves />
          </TabsContent>
        </Tabs>
      </CanAccess>
      <CanAccess roles={[ROLES.ENGINEER, ROLES.CREDIT_OFFICER]}>
        <ListingHeader
          title="Leave Management"
          description="Manage your leaves here."
          buttonLabel={"New Leave"}
          onAddButtonClicked={() => navigate("/leave/create")}
        />
        <YourLeaves />
      </CanAccess>
    </div>
  );
}

function YourLeaves() {
  const { columnFilters, pagination, setColumnFilters, setSorting, sorting } = useTableStates();
  const [leaveId, setLeaveId] = useState("");
  const [leaveStatus, setLeaveStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    isLoading,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["your-leaves", sorting, columnFilters],
    queryFn: async () => {
      const res = await client.get("/api/users/leaves", {
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

      return {
        raw_data: res?.data?.data,
        data: res?.data?.data?.leaves,
        total: res?.data?.data?.leaves?.length,
      };
    },
  });

  const { mutateAsync: cancelLeave } = useMutation<void, unknown, { status: string }>({
    mutationKey: ["leaveStatusUpdate"],
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated!",
        description: `Status has been updated to ${status}.`,
      });

      refetch();
      setIsOpen(false);
    },
    mutationFn: async ({ status }: { status: string }) => {
      return await client.put(`/api/leaves/${leaveId}/cancel`, { status });
    },
  });

  const handleOpenChange = (status: string, id: string) => {
    setLeaveStatus(status);
    setLeaveId(id);
    if (status === STATUS.PENDING) {
      setIsOpen(!isOpen);
    }
  };

  const closeActionDialog = () => {
    setIsOpen(false);
  };

  return (
    <div className="h-full flex-1 flex-col space-y-2 md:flex">
      <div className={"grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4"}>
        {[
          {
            title: "Annual Leave",
            current: queryData?.raw_data?.annual_leave,
            remaining: queryData?.raw_data?.remaining_annual_leave,
          },
          {
            title: "Medical Leave",
            current: queryData?.raw_data?.medical_leave,
            remaining: queryData?.raw_data?.remaining_medical_leave,
          },
          {
            title: "Maternity Leave",
            current: queryData?.raw_data?.maternity_leave,
            remaining: queryData?.raw_data?.remaining_maternity_leave,
          },
          {
            title: "Paternity Leave",
            current: queryData?.raw_data?.paternity_leave,
            remaining: queryData?.raw_data?.remaining_paternity_leave,
          },
          {
            title: "Birthday Leave",
            current: queryData?.raw_data?.birthday_leave,
            remaining: queryData?.raw_data?.remaining_birthday_leave,
          },
        ].map(({ title, current, remaining }) => (
          <Card className={"p-4"} key={title}>
            <div className={"flex flex-col space-y-2"}>
              <h1 className={"text-sm font-medium text-muted-foreground"}>{title}</h1>
              <span className={"text-lg font-bold"}>
                <span className={"text-xl"}>
                  {Number(remaining)} / {Number(current)}
                </span>
              </span>
              <Progress value={(Number(remaining) / Number(current)) * 100} />
            </div>
          </Card>
        ))}
      </div>
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to cancel this leave?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => closeActionDialog()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700"
              onClick={() => {
                if (leaveStatus === STATUS.PENDING) {
                  cancelLeave({ status: STATUS.CANCELLED });
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DataTableProvider
        data={queryData?.data || []}
        isLoading={isLoading}
        columns={yourLeave({ handleOpenChange })}
        tableSetting={{
          enableRowSelection: false,
          state: { columnFilters, sorting },
          onColumnFiltersChange: setColumnFilters,
          onSortingChange: setSorting,
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
              options: LeaveStatusOptions,
            },
          ]}
        />

        <DataTable />
        <DataTablePagination />
      </DataTableProvider>
    </div>
  );
}

function ApproveLeaves({ setTabs }) {
  const { columnFilters, pagination, setColumnFilters, setPagination, setSorting, sorting } = useTableStates();
  const [date, setDate] = useState<DateRange>();

  const {
    isLoading,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["leaves", pagination, sorting, columnFilters],
    queryFn: async () => {
      const search = columnFilters.find(({ id }) => id === "user_name")?.value;
      const date = columnFilters?.find(({ id }) => id === "days_apply")?.value;

      const res = await client.get("/api/leaves", {
        params: {
          status: (columnFilters?.find(({ id }) => id === "status")?.value as string[])?.join(","),
          leave_type: (columnFilters?.find(({ id }) => id === "leave_type")?.value as string[])?.join(","),
          branch: (columnFilters?.find(({ id }) => id === "branch")?.value as number[])?.join(","),
          date_from: date?.from,
          date_to: date?.to,
          direction: "asc",
          sort: "status",
          page: pagination?.pageIndex + 1,
          search,
          ...sorting?.reduce((p, c) => {
            return {
              ...p,
              sort:
                {
                  user_name: "user",
                  days_apply: "start_date",
                  approver_name: "approver",
                }[c?.id] ?? c?.id,
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

  const { isLoading: isBranchLoading, data: branchData } = useQuery({
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

  return (
    <div className="h-full flex-1 flex-col space-y-2 md:flex">
      <DataTableProvider
        data={queryData?.branch || []}
        isLoading={isLoading}
        columns={approveLeave({ refetch })}
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

        <div className="flex items-center space-x-4">
          <DataTableFilterBar
            filters={[
              {
                radio: true,
                key: "status",
                title: "Status",
                options: LeaveStatusOptions,
              },
              {
                radio: true,
                key: "leave_type",
                title: "Leave Type",
                options: Object.entries(LeaveTypes).map(([key, value]) => ({
                  label: value,
                  value: key,
                })),
              },
              {
                radio: true,
                key: "branch",
                title: "Branch",
                options: branchData?.branch || [],
              },
              {
                isDateRange: true,
                key: "days_apply",
                title: "Leave Date",
                options: [],
              },
            ]}
          />
        </div>

        <DataTable />
        <DataTablePagination />
      </DataTableProvider>
    </div>
  );
}
