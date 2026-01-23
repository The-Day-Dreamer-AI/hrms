import {DataTableColumnHeader} from "@/components/ui/data-table/data-table-column-header.tsx";
import {DataTableRowActions} from "@/components/ui/data-table/data-table-row-actions.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {User} from "./type.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {CanCopy} from "@/components/ui/can-copy.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {EditIcon} from "lucide-react";
import {useNavigate} from "react-router-dom";

export const columns: ColumnDef<User>[] = [
  {
    id: "user_name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="User Name" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2 items-center">
          <Avatar>
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>{row.getValue("user_name")[0]}</AvatarFallback>
          </Avatar>
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("user_name")}
          </span>
        </div>
      );
    },
  },
  {
    id: "Branch",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            <Badge>{row.original.branch?.name || "-"}</Badge>
          </span>
        </div>
      );
    },
  },
  {
    id: "user-email",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({row}) => {
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
    id: "user-phone",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Phone number" />
    ),
    cell: ({row}) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.phone ? (
              <CanCopy textValue={row.original.phone}>
                {row.original.phone}
              </CanCopy>
            ) : (
              "-"
            )}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => <Actions id={row.original.id} />,
  },
];

function Actions({id}: {id: number}) {
  const navigate = useNavigate();
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        onClick={() => navigate(`/user/create?mode=edit&id=${id}`)}
      >
        <EditIcon className={"mr-2 h-4 w-4"} />
        Edit user info
      </DropdownMenuItem>
    </DataTableRowActions>
  );
}
