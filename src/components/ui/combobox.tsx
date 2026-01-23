import * as React from "react";
import {CaretSortIcon, CheckIcon} from "@radix-ui/react-icons";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Waypoint} from "react-waypoint";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Loader} from "lucide-react";
import {useDebounceCallback} from "@/hooks/useDebounceCallback";

export function Combobox({
  onSearchChange = (a) => {},
  onFetchNextPage,
  isLoading,
  onChange,
  options,
  disabled,
  value,
}: {
  onSearchChange?: (a: string) => void;
  value: string;
  onChange: (value: string) => void;
  options: {value: string; label: string}[];
  onFetchNextPage: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const debounced = useDebounceCallback((value) => onSearchChange(value), 500);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[293px] justify-between"
        >
          {value
            ? options?.find((item) => item.value === value)?.label || value
            : "Select an item..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[293px] p-0">
        <Command
          onChange={(e) => debounced((e.target as any)?.value)}
          shouldFilter={true}
        >
          <CommandInput placeholder="Search item..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <Waypoint onEnter={onFetchNextPage} />
              No items found.
            </CommandEmpty>
            <CommandGroup>
              {options?.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={() => {
                    onChange(framework.value === value ? "" : framework.value);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <Waypoint onEnter={onFetchNextPage} />
            {isLoading && <Loader className="h-4 w-4 animate-spin mx-auto" />}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
