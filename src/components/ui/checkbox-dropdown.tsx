import {cn} from "@/lib/utils";
import {Popover, PopoverTrigger, PopoverContent} from "./popover";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "./command";
import {PlusCircleIcon, CheckIcon, Loader2} from "lucide-react";
import {Button} from "./button";
import {Badge} from "./badge";
import {Waypoint} from "react-waypoint";
import {useDebounceCallback} from "@/hooks/useDebounceCallback";

export function CheckboxDropdown({
  value,
  onChange,
  loadNextPage,
  onSearchChange = (a) => {},
  options,
  isLoading,
  selectOne = false,
  name,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: {value: string; name: string}[];
  loadNextPage: () => void;
  isLoading: boolean;
  name: string;
  onSearchChange?: (a: string) => void;
  selectOne?: boolean;
}) {
  const debounced = useDebounceCallback((value) => onSearchChange(value), 500);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 border-dashed space-x-2">
          <PlusCircleIcon size={12} />
          <p>{name}</p>
          {value.length > 0 && <div className="h-6 border-r" />}
          {value.length < 3 ? (
            options
              .filter(({value: v}) => value.includes(v))
              .map(({value, name}) => (
                <Badge variant="secondary" key={value}>
                  {name}
                </Badge>
              ))
          ) : (
            <Badge variant="secondary">{value.length} Selected</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-[230px] p-0">
        <Command
          onChange={(e) => debounced((e.target as any)?.value)}
          shouldFilter={true}
        >
          <CommandInput placeholder="Search item..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <Waypoint onEnter={loadNextPage} />
              No items found.
            </CommandEmpty>
            <CommandGroup>
              {options?.map(({value: v, name}) => (
                <CommandItem
                  key={v}
                  value={v}
                  onSelect={() => {
                    if (value.includes(v))
                      onChange(value.filter((i) => i !== v));
                    else {
                      if (selectOne && value.length > 0) return;
                      onChange([...value, v]);
                    }
                  }}
                >
                  {name}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value.includes(v) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <Waypoint onEnter={loadNextPage} />
            {isLoading && (
              <div className="w-full pb-2">
                <Loader2 className="animate-spin mx-auto size-5" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
