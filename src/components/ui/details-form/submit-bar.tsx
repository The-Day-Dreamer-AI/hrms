import {cn} from "@/lib/utils";
import {useAutoFormProvider} from "../auto-form";
import {Button} from "../button";
import {Card} from "../card";
import {InfoCircledIcon} from "@radix-ui/react-icons";
import {LoaderCircle} from "lucide-react";

export function SubmitBar({isLoading}: {isLoading: boolean}) {
  const {isDirty, form} = useAutoFormProvider();

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full p-1 md:p-4 duration-300 ease-in-out transition-all",
        !isDirty ? "translate-y-[100%]" : ""
      )}
    >
      <Card className="max-w-3xl rounded-md p-2 flex items-center space-x-2 justify-between mx-auto">
        <div className="flex items-start space-x-2 px-2">
          <InfoCircledIcon className="h-[1.25rem] w-[1.25rem]" />
          <p className="text-sm">Careful — you have unsaved changes!</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => {
              form.reset(form.formState.defaultValues, {keepDirty: false});
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <LoaderCircle className={"animate-spin h-4 w-4 me-1"} />
            )}
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}
