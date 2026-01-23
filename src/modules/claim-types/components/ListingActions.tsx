import {useNavigate} from "react-router-dom";
import {DataTableRowActions} from "@/components/ui/data-table/data-table-row-actions.tsx";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {Edit} from "lucide-react";

export function Actions({id}: { id: string | number }) {
    const navigate = useNavigate()

    return <DataTableRowActions>
        <DropdownMenuItem onClick={() => navigate(`/claim-types/create?mode=edit&id=${id}`)}>
            <Edit className={'h-4 w-4 mr-2'}/>
            Edit claim type
        </DropdownMenuItem>
    </DataTableRowActions>
}