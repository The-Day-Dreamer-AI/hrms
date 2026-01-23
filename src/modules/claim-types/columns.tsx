import {DataTableColumnHeader} from "@/components/ui/data-table/data-table-column-header.tsx";
import {Actions} from "@/modules/claim-types/components/ListingActions.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {ClaimTypes} from "./type.ts";

export const columns: ColumnDef<ClaimTypes>[] = [
    {
        accessorKey: "name",
        enableSorting: false,
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Name"/>
        ),
        cell: ({row}) => {
            const name = row?.original["name"];
            return (
                <div className="flex space-x-2">
                  <span className="max-w-[500px] truncate font-medium">
                    {name}
                  </span>
                </div>
            );
        },
    },
    {
        id: "Default Claim Limits",
        accessorKey: "default_limit",
        enableSorting: false,
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Default Claim Limit"/>
        ),
        cell: ({row}) => {
            const claimLimit = row?.original["default_limit"];
            return (
                <div className="flex space-x-2">
                  <span className="max-w-[500px] truncate font-medium">
                    {claimLimit || 'No limit'}
                  </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({row}) => <Actions id={row?.original['id']}/>
    },
];

