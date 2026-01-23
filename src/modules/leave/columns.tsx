import dayjs from "dayjs";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { CanAccess, NOT_HR, ROLES } from "@/acl.ts";
import { client } from "@/axios.ts";
import { ViewAttachment } from "@/components/image-viewer.tsx";
import { StatusUpdateSelector } from "@/components/status-update-selector.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { STATUS_COLOR } from "@/constants.ts";
import { cn } from "@/lib/utils.ts";

import { Leave } from "./type.ts";

export const approveLeave = ({
  refetch,
  enableSelection = false,
}: {
  refetch: () => void;
  enableSelection?: boolean;
}): ColumnDef<Leave>[] => [
  ...(enableSelection
    ? [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <div>
              <Checkbox
                checked={row?.getIsSelected()}
                onCheckedChange={(value) => row?.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ]
    : []),
  {
    id: "user_name",
    accessorKey: "user_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Applicant" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("user_name") ?? `${row.original["first_name"]} ${row.original["last_name"]}`}
          </span>
        </div>
      );
    },
  },
  {
    id: "branch",
    accessorKey: "branch_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Branch" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge className="whitespace-nowrap">{row.original["branch_name"]}</Badge>
        </div>
      );
    },
  },
  {
    id: "leave_type",
    accessorKey: "leave_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Type" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium capitalize">
            {`${row?.original?.leave_type?.replace("_", " ")} ${row?.original?.half_day || row?.original?.half_day?.toUpperCase() === "FULLDAY" ? "(" + row?.original?.half_day?.toUpperCase() + ")" : ""}`}
          </span>
        </div>
      );
    },
  },
  {
    id: "reason",
    accessorKey: "reason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium capitalize">{row?.original?.reason}</span>
        </div>
      );
    },
  },
  {
    id: "days_apply",
    accessorKey: "start_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Period" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium text-muted-foreground">
            {dayjs(row.original.start_date).format("YYYY/MM/DD")} to {dayjs(row.original.end_date).format("YYYY/MM/DD")}
            <br />
            {`(${row?.original?.days_apply} Days)`}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Status" />,
    cell: ({ row }) => {
      const currentStatus = row.original.status ?? row.original?.leave_status;
      let component;

      switch (currentStatus) {
        case "approved":
          component = (
            <>
              <CanAccess roles={NOT_HR}>
                <Badge className={cn(STATUS_COLOR[currentStatus], "capitalize dark:text-white")}>
                  {currentStatus?.replace("_", "")}
                </Badge>
              </CanAccess>
              <CanAccess roles={[ROLES.HR]}>
                <LeaveStatusUpdateItem
                  refetch={refetch}
                  id={`${row.original.id}`}
                  currentValue={currentStatus}
                  isLeave={true}
                  canRevoke={true}
                />
              </CanAccess>
            </>
          );
          break;
        case "pending":
          component = (
            <>
              <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR]}>
                <LeaveStatusUpdateItem
                  refetch={refetch}
                  id={`${row.original.id}`}
                  currentValue={currentStatus}
                  isLeave={true}
                  canRevoke={false}
                />
              </CanAccess>
              <CanAccess roles={[ROLES.BRANCH_MANAGER, ROLES.HR]}>
                <Badge className={cn(STATUS_COLOR[currentStatus], "capitalize dark:text-white")}>
                  {currentStatus?.replace("_", "")}
                </Badge>
              </CanAccess>
            </>
          );
          break;
        default:
          component = (
            <>
              <Badge className={cn(STATUS_COLOR[currentStatus], "capitalize dark:text-white")}>
                {currentStatus?.replace("_", "")}
              </Badge>
            </>
          );
          break;
      }

      return component;
    },
  },
  {
    id: "attachment",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Attachment" />,
    cell: ({ row }) => {
      return row?.original?.attachment ? <ViewAttachment url={row?.original?.attachment} /> : "-";
    },
  },
  {
    id: "approver_name",
    accessorKey: "approver_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By/ Revoked By" />,
    cell: ({ row }) => {
      const approverName = row.getValue("approver_name") || null;
      const revokerName = row.original.revoker_name || null;
      return (
        <div className="space-y-2">
          <p className="max-w-[500px] truncate font-medium">
            {revokerName ? `${revokerName}` : approverName ? `${approverName}` : "-"}
          </p>
        </div>
      );
    },
  },
  // {
  //   id: "actions",
  //   cell: () => (
  //     <DataTableRowActions>
  //       <DropdownMenuItem onClick={() => {}} disabled={true}>
  //         <ViewIcon className={"mr-2 h-4 w-4"} />
  //         View Details
  //       </DropdownMenuItem>
  //     </DataTableRowActions>
  //   ),
  // },
];

export function LeaveStatusUpdateItem({
  currentValue,
  id,
  refetch,
  isLeave,
  canRevoke,
}: {
  currentValue: string;
  id: string;
  refetch: () => void;
  isLeave: boolean;
  canRevoke: boolean;
}) {
  const [state, setState] = useState(currentValue);
  const { toast } = useToast();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["claimStatusUpdate"],
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated !",
        description: `Status has been updated to ${status}.`,
      });
      setState(status);
      refetch();
    },
    mutationFn: async ({ status }: { status: string }) => {
      return await client.put(`/api/leaves/${id}`, { status });
    },
  });
  return (
    <div className="flex space-x-2">
      <StatusUpdateSelector
        onChange={(status) => mutateAsync({ status })}
        isPending={isPending}
        state={state}
        isLeave={isLeave}
        canRevoke={canRevoke}
      />
    </div>
  );
}
