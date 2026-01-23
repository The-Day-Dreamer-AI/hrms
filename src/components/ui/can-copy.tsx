import { Button } from "@/components/ui/button.tsx";
import { CopyIcon } from "@radix-ui/react-icons";
import { ReactNode, useEffect, useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CanCopy({
  children,
  textValue,
}: {
  children: ReactNode;
  textValue: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, copy] = useCopyToClipboard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const timer1 = setTimeout(() => setOpen(false), 500);
      return () => clearTimeout(timer1);
    }
  }, [open]);

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <div className={"group relative min-h-6 pe-8"}>
          {children}
          <div
            className={
              "absolute hidden group-hover:block top-0 right-0 duration-200 z-10"
            }
          >
            <Button
              size={"icon"}
              className={"h-6 w-6"}
              variant={"outline"}
              onClick={async () => {
                await copy(textValue);
                setOpen(true);
              }}
            >
              <CopyIcon />
            </Button>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>Copied {value} !</TooltipContent>
    </Tooltip>
  );
}
