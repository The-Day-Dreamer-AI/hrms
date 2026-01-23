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

import { MarketingClaims } from "./type.ts";

export const userColumns = ({
  handleOpenChange,
}: {
  handleOpenChange: (action: string, status: string, id: string | number) => void;
}): ColumnDef<MarketingClaims>[] => [
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
    id: "website_url",
    accessorKey: "website_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Website" />,
    cell: ({ row }) => {
      const website_url = row?.original?.website?.url;
      const website_name = row?.original?.website?.name;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {website_name ? `${website_url} (${website_name})` : website_url}
          </span>
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
    accessorKey: "status",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Status" />,
    cell: ({ row }) => {
      const currentValue = row.getValue("status") as string;
      return (
        <>
          <Badge className={cn(STATUS_COLOR[currentValue], "capitalize dark:text-white")}>{currentValue}</Badge>
        </>
      );
    },
  },
  {
    accessorKey: "approver_name",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.original?.approver?.first_name || "-"}</span>
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
  return (
    <DataTableRowActions>
      <DropdownMenuItem onClick={() => handleOpenChange(ACTION_STATUS.EDIT, status, id)} disabled={status !== CLAIM_STATUS.PENDING}>
        <div className="flex items-center">
          <MessageCircleQuestion className="mr-2 h-4 w-4" />
          <span>Edit Claim</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleOpenChange(ACTION_STATUS.CANCEL, status, id)} disabled={status !== CLAIM_STATUS.PENDING}>
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
    mutationKey: ["marketing-claim-status-update"],
    onError: () => {
      toast({
        title: "Oops, Something went wrong.",
        description: `Please try again later`,
      });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated !",
        description: `Status has been updated to ${status}.`,
      });
      setState(status);
      refetch();
    },
    mutationFn: async ({ status }: { status: string }) => {
      return await client.patch(`/api/user-marketing-claims/${id}`, { status });
    },
  });
  return (
    <div className="flex space-x-2">
      <StatusUpdateSelector onChange={(status) => mutateAsync({ status })} isPending={isPending} state={state} />
    </div>
  );
}
