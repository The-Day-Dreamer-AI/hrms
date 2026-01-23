import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import dayjs from "dayjs";
import { MessageCircleX } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import { ViewAttachment } from "@/components/image-viewer.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions";
import { STATUS } from "@/constants";
import { STATUS_COLOR } from "@/constants.ts";
import { cn } from "@/lib/utils.ts";
import { Leave } from "@/modules/leave/type.ts";

export const yourLeave = ({
  handleOpenChange,
}: {
  handleOpenChange: (leave: string, id: string | number) => void;
}): ColumnDef<Leave>[] => [
  {
    id: "leave_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Leave Type" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium capitalize">
            {row?.original?.leave_type?.replace("_", " ")}
          </span>
        </div>
      );
    },
  },
  {
    id: "reason",
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
      const currentStatus = row.original.status;
      return (
        <Badge className={cn(STATUS_COLOR[currentStatus], "capitalize dark:text-white")}>
          {row.getValue("status")}
        </Badge>
      );
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
      const { approver, revoker } = row.original;

      const approverName =
        approver?.first_name && approver?.last_name ? `${approver.first_name} ${approver.last_name}` : null;
      const revokerName =
        revoker?.first_name && revoker?.last_name ? `${revoker.first_name} ${revoker.last_name}` : null;
      return (
        <div className="space-y-2">
          <p className="max-w-[500px] truncate font-medium">
            {revokerName ? `${revokerName}` : approverName ? `${approverName}` : "-"}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => <ActionCell row={row} handleOpenChange={handleOpenChange} />,
  },
];

const ActionCell = ({ row, handleOpenChange }) => {
  const isDisabled = row.original.status !== STATUS.PENDING;

  return (
    <DataTableRowActions>
      <DropdownMenuItem
        className={`cursor-pointer ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => !isDisabled && handleOpenChange(row.original.status, row.original.id)}
      >
        <div className="flex items-center">
          <MessageCircleX className="mr-2 h-4 w-4" />
          <span>Cancel Leave</span>
        </div>
      </DropdownMenuItem>
    </DataTableRowActions>
  );
};
