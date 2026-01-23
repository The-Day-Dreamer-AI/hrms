import dayjs from "dayjs";
import { MessageCircleQuestion, MessageCircleX } from "lucide-react";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { client } from "@/axios.ts";
import { ViewAttachment } from "@/components/image-viewer.tsx";
import { StatusUpdateSelector } from "@/components/status-update-selector.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions.tsx";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { ACTION_STATUS, CLAIM_STATUS, STATUS_COLOR } from "@/constants.ts";
import { cn } from "@/lib/utils.ts";

import { Claim } from "./type.ts";

export const yourClaims = ({
  handleOpenChange,
}: {
  handleOpenChange: (action: "edit" | "cancel", status: string, id: string | number) => void;
}): ColumnDef<Claim>[] => [
  {
    accessorKey: "date",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Date" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{dayjs(row.getValue("date")).format("YYYY/MM/DD")}</span>
        </div>
      );
    },
  },
  {
    id: "claim_type",
    accessorKey: "claim_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Type" />,
    cell: ({ row }) => {
      const claimType = row.getValue("claim_type") as { name: string | undefined };
      return <div className="flex space-x-2">{claimType?.name ?? ""}</div>;
    },
  },
  {
    accessorKey: "receipt_number",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Receipt Number" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue("receipt_number")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Amount" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue("amount")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Remarks" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue("remarks")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "attachment",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Attachment" />,
    cell: ({ row }) => {
      return row?.original?.attachment ? <ViewAttachment url={row?.original?.attachment} /> : "-";
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
    accessorKey: "approver_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row?.original?.approver?.first_name && row?.original?.approver?.last_name
              ? `${row?.original?.approver?.first_name} ${row?.original?.approver?.last_name}`
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    id: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => {
      return <Action id={row.original.id} status={row.original.status} handleOpenChange={handleOpenChange} />;
    },
  },
];

export function Action({
  id,
  status,
  handleOpenChange,
}: {
  id: string | number;
  status: string;
  handleOpenChange: (action: string, status: string, id: string | number) => void;
}) {
  const isPending = status === CLAIM_STATUS.PENDING;

  return (
    <DataTableRowActions>
      <DropdownMenuItem onClick={() => handleOpenChange(ACTION_STATUS.EDIT, status, id)} disabled={!isPending}>
        <div className="flex items-center">
          <MessageCircleQuestion className="mr-2 h-4 w-4" />
          <span>Edit Claim</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleOpenChange(ACTION_STATUS.CANCEL, status, id)} disabled={!isPending}>
        <div className="flex items-center">
          <MessageCircleX className="mr-2 h-4 w-4" />
          <span>Cancel Claim</span>
        </div>
      </DropdownMenuItem>
    </DataTableRowActions>
  );
}

export function ClaimStatusUpdateItem({
  currentValue,
  id,
  refetch,
}: {
  currentValue: string;
  id: string;
  refetch: () => void;
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
      return await client.patch(`/api/user-claims/${id}`, { status });
    },
  });
  return (
    <div className="flex space-x-2">
      <StatusUpdateSelector onChange={(status) => mutateAsync({ status })} isPending={isPending} state={state} />
    </div>
  );
}
