import dayjs from "dayjs";
import { ViewIcon } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { CanAccess, ROLES } from "@/acl.ts";
import { client } from "@/axios.ts";
import { ViewAttachment } from "@/components/image-viewer.tsx";
import { StatusUpdateSelector } from "@/components/status-update-selector.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions.tsx";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { STATUS_COLOR } from "@/constants.ts";
import { cn } from "@/lib/utils.ts";

import { Claim } from "./type.ts";

export const columns = ({ refetch, enableSelection = false, enableEdit = false }): ColumnDef<Claim>[] => [
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
    id: "claim_type",
    accessorKey: "claim_type_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Type" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row?.original?.claim_type_name ?? null}
          {typeof row?.original?.claim_type === "object" && row?.original?.claim_type
            ? row?.original?.claim_type?.name
            : row?.original?.claim_type?.toString()}
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
    id: "date",
    accessorKey: "date",
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
    accessorKey: "claim_limit",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Usage" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.utilized_limit} / {row.original.claim_limit}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Claim Status" />,
    cell: ({ row }) => {
      const currentValue = row.getValue("status") as string;
      enableEdit = currentValue === "pending";
      return (
        <>
          {enableEdit ? (
            <>
              <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <ClaimStatusUpdateItem refetch={refetch} currentValue={currentValue} id={`${row.original.id}`} />
              </CanAccess>
              <CanAccess roles={[ROLES.BRANCH_MANAGER, ROLES.CREDIT_OFFICER]}>
                <Badge className={cn(STATUS_COLOR[currentValue], "capitalize dark:text-white")}>{currentValue}</Badge>
              </CanAccess>
            </>
          ) : (
            <Badge className={cn(STATUS_COLOR[currentValue], "capitalize dark:text-white")}>{currentValue}</Badge>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "approver_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue("approver_name") || "-"}</span>
        </div>
      );
    },
  },

  {
    id: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => {
      return <Action id={row.original.id} />;
    },
  },
];

export function Action({ id }: { id: string | number }) {
  const navigate = useNavigate();
  return (
    <DataTableRowActions>
      <DropdownMenuItem onClick={() => navigate(`/claim/create?mode=edit&id=${id}`)} disabled={true}>
        <ViewIcon className={"mr-2 h-4 w-4"} />
        View Claims
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
