import {DataTableColumnHeader} from "@/components/ui/data-table/data-table-column-header.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {MarketingClaims} from "./type.ts";
import dayjs from "dayjs";

import {useNavigate} from "react-router-dom";
import {DataTableRowActions} from "@/components/ui/data-table/data-table-row-actions.tsx";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {ViewIcon} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {useState} from "react";
import {useToast} from "@/components/ui/use-toast.ts";
import {client} from "@/axios.ts";
import {StatusUpdateSelector} from "@/components/status-update-selector.tsx";
import {CanAccess, ROLES} from "@/acl.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {cn} from "@/lib/utils.ts";
import {STATUS_COLOR} from "@/constants.ts";
import {ViewAttachment} from "@/components/image-viewer.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export const columns = ({
  refetch,
  enableSelection = false,
  enableEdit = false,
}): ColumnDef<MarketingClaims>[] => [
  ...(enableSelection
    ? [
        {
          id: "select",
          header: ({table}) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({row}) => (
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
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Applicant" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("user_name") ??
              `${row.original["first_name"]} ${row.original["last_name"]}`}
          </span>
        </div>
      );
    },
  },
  {
    id: "marketing_claim_type",
    accessorKey: "marketing_claim_type_name",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Marketing Claim Type" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          {row.original["marketing_claim_type_name"]}
        </div>
      );
    },
  },
  {
    id: "branch",
    accessorKey: "branch_name",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <Badge className="whitespace-nowrap">
            {row.original["branch_name"]}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "date",
    accessorKey: "date",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Claim Date" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {dayjs(row.getValue("date")).format("YYYY/MM/DD")}
          </span>
        </div>
      );
    },
  },
  {
    id: "receipt_number",
    accessorKey: "receipt_number",
    enableSorting: false,
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Receipt Number" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("receipt_number")}
          </span>
        </div>
      );
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Claim Amount" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("amount")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "claim_limit",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Claim Usage" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.utilized_limit} / {row.original.marketing_claim_limit}
          </span>
        </div>
      );
    },
  },
  {
    id: "remarks",
    accessorKey: "remarks",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("remarks")}
          </span>
        </div>
      );
    },
  },
  {
    id: "attachement",
    accessorKey: "attachment",
    enableSorting: false,
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Attachment" />
    ),
    cell: ({row}) => {
      return row?.original?.attachment ? <ViewAttachment url={row?.original?.attachment} /> : '-';
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Claim Status" />
    ),
    cell: ({row}) => {
      const currentValue = row.getValue("status") as string;
      enableEdit = currentValue === 'pending';
      return (
        <>
          {enableEdit ? (
            <>
              <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <ClaimStatusUpdateItem
                  refetch={refetch}
                  currentValue={currentValue}
                  id={`${row.original.id}`}
                />
              </CanAccess>
              <CanAccess roles={[ROLES.BRANCH_MANAGER]}>
                <Badge
                  className={cn(
                    STATUS_COLOR[currentValue],
                    "capitalize dark:text-white"
                  )}
                >
                  {currentValue}
                </Badge>
              </CanAccess>
            </>
          ) : (
            <Badge
              className={cn(
                STATUS_COLOR[currentValue],
                "capitalize dark:text-white"
              )}
            >
              {currentValue}
            </Badge>
          )}
        </>
      );
    },
  },
  {
    id: "website_url",
    accessorKey: "website_url",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({row}) => {
      const websiteData = row?.original?.website_name ? 
                          `${row?.original?.website_url} (${row.original.website_name})`: 
                          row?.original?.website_url
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
          {websiteData}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "website_limit",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Website Limit" />
    ),
    cell: ({row}) => {
      const websiteLimit = row?.original?.website_utilized_limit && row?.original?.website_limit ?
                          `${row.original.website_utilized_limit} / ${row.original.website_limit}`:
                          "-"
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {websiteLimit}
          </span>
        </div>
      );
    },
  },
  {
    id: "approver_name",
    accessorKey: "approver_name",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Approved By" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("approver_name") || "-"}
          </span>
        </div>
      );
    },
  },
  // {
  //   id: "action",
  //   header: ({column}) => (
  //     <DataTableColumnHeader column={column} title="Action" />
  //   ),
  //   cell: ({row}) => {
  //     return <Action id={row.original.id} />;
  //   },
  // },
];

export function Action({id}: {id: string | number}) {
  const navigate = useNavigate();
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        onClick={() => navigate(`/claim/create?mode=edit&id=${id}`)}
        disabled={true}
      >
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
  const {toast} = useToast();
  const {mutateAsync, isPending} = useMutation({
    mutationKey: ["marketing-claim-status-update"],
    onError: () => {
      toast({
        title: "Oops, Something went wrong.",
        description: `Please try again later`,
      });
    },
    onSuccess: (_, {status}) => {
      toast({
        title: "Status updated !",
        description: `Status has been updated to ${status}.`,
      });
      setState(status);
      refetch();
    },
    mutationFn: async ({status}: {status: string}) => {
      return await client.patch(`/api/user-marketing-claims/${id}`, {status});
    },
  });
  return (
    <div className="flex space-x-2">
      <StatusUpdateSelector
        onChange={(status) => mutateAsync({status})}
        isPending={isPending}
        state={state}
      />
    </div>
  );
}
