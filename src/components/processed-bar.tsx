import {cn} from "@/lib/utils";
import {InfoCircledIcon} from "@radix-ui/react-icons";
import {Cpu, LoaderCircle} from "lucide-react";
import {Card} from "./ui/card";
import {Button} from "./ui/button";

export function ProcessedBar({
  id,
  showBar,
  isLoading,
  onClose,
  onSubmit,
}: {
  id: string[];
  showBar: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (ids: string[]) => void;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-0 md:top-0 left-0 h-fit w-full p-1 md:p-4 duration-300 ease-in-out transition-all z-[1000]",
        !showBar ? "translate-y-[100%] md:translate-y-[-100%]" : ""
      )}
    >
      <Card className="rounded-md p-2 flex items-center flex-wrap gap-2 justify-between mx-auto">
        <div className="flex items-start space-x-2 px-2">
          <InfoCircledIcon className="h-[1.25rem] w-[1.25rem]" />
          <p className="text-sm">You have selected {id?.length} items </p>
        </div>
        <div className="flex items-center space-x-2 justify-end md:w-fit w-full">
          <Button
            disabled={isLoading}
            onClick={onClose}
            variant="outline"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => onSubmit(id)}
          >
            {isLoading ? (
              <LoaderCircle className={"animate-spin h-4 w-4 me-1"} />
            ) : (
              <Cpu className={"h-4 w-4 me-1"} />
            )}
            Process Items
          </Button>
        </div>
      </Card>
    </div>
  );
}
