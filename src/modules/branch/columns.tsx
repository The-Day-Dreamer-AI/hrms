import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header.tsx";
import { DataTableRowActions } from "@/components/ui/data-table/data-table-row-actions.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { Branch } from "./type.ts";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { EditIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
];

export function Action({ id }: { id: string | number }) {
  const navigate = useNavigate();
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        onClick={() => navigate(`/branch/create?mode=edit&id=${id}`)}
      >
        <EditIcon className={"mr-2 h-4 w-4"} />
        Edit Branch
      </DropdownMenuItem>
    </DataTableRowActions>
  );
}
