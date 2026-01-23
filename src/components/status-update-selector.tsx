import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {Ban, CheckCircle2, Clock, Undo2} from "lucide-react";
import {Badge} from "./ui/badge";

export function StatusUpdateSelector({
  state,
  isPending,
  onChange,
  isLeave = false,
  canRevoke = false,
}: {
  onChange: (v: string) => void;
  isPending: boolean;
  state: string;
  isLeave?: boolean;
  canRevoke?: boolean;
}) {
  return (
    <div className="flex space-x-2">
      {state === "processed" ? (
        <Badge className="capitalize">{state}</Badge>
      ) : (
        <Select
          value={state}
          onValueChange={(status) => onChange(status)}
          disabled={isPending}
        >
          <SelectTrigger className="max-w-[180px] h-7">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {[
              {
                title: "Approved",
                Icon: CheckCircle2,
                value: "approved",
                disabled: canRevoke,
              },
              {
                title: "Rejected",
                Icon: Ban,
                value: "rejected",
                disabled: canRevoke,
              },
              {
                title: "Pending",
                Icon: Clock,
                value: "pending",
                disabled: canRevoke,
              },
              ...(isLeave
                ? [
                    {
                      title: "Revoked",
                      Icon: Undo2,
                      value: "revoked",
                      disabled: !canRevoke,
                    },
                  ]
                : [])
            ].map(({Icon, value, title, disabled}) => (
              <SelectItem value={value} key={value} disabled={disabled}>
                <div className="flex space-x-2 items-center">
                  <Icon className={"mr-2 h-4 w-4"} />
                  {title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
