import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { Agency } from "./type.ts";
import { CanCopy } from "@/components/ui/can-copy.tsx";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { EditIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Agency>[] = [
  {
    id: "company_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.company_name}
          </span>
        </div>
      );
    },
  },
  {
    id: "bank_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bank Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <CanCopy textValue={row.original.bank_name}>
              {row.original.bank_name}
            </CanCopy>
          </span>
        </div>
      );
    },
  },
  {
    id: "account_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <CanCopy textValue={row.original.account_number}>
              {row.original.account_number}
            </CanCopy>
          </span>
        </div>
      );
    },
  },
  {
    id: "Contact Person",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Person" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.contact_person}
          </span>
        </div>
      );
    },
  },
  {
    id: "Contact Email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <CanCopy textValue={row.original.email}>
              {row.original.email}
            </CanCopy>
          </span>
        </div>
      );
    },
  },
  {
    id: "Contact Phone Number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Phone Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <CanCopy textValue={row.original.phone}>
              {row.original.phone}
            </CanCopy>
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Action id={row?.original?.id} />,
  },
];

export function Action({ id }: { id: string | number }) {
  const navigate = useNavigate();
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        onClick={() => navigate(`/agency/create?mode=edit&id=${id}`)}
      >
        <EditIcon className={"mr-2 h-4 w-4"} />
        Edit Agency
      </DropdownMenuItem>
    </DataTableRowActions>
  );
}
