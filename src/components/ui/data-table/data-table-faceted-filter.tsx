import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";

import * as React from "react";

import { Column } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command.tsx";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/lib/utils.ts";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  radio: boolean;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  radio,
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  return (
    <div>
      <span className="hidden md:block">
        <Popover>
          <PopoverTrigger>
            <FilterButton radio={radio} options={options} column={column} title={title} />
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <FilterList radio={radio} options={options} column={column} title={title} />
          </PopoverContent>
        </Popover>
      </span>
      <span className="block md:hidden">
        <Drawer>
          <DrawerTrigger>
            <FilterButton radio={radio} options={options} column={column} title={title} />
          </DrawerTrigger>
          <DrawerContent>
            <FilterList radio={radio} options={options} column={column} title={title} />
          </DrawerContent>
        </Drawer>
      </span>
    </div>
  );
}

const FilterButton = <TData, TValue>({ column, title, options }: DataTableFacetedFilterProps<TData, TValue>) => {
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const [parent] = useAutoAnimate();

  return (
    <Button variant="outline" size="sm" className="border-dashed h-10" asChild>
      <div>
        <PlusCircledIcon className="mr-2 h-4 w-4" />
        {title}
        {selectedValues?.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
              {selectedValues.size}
            </Badge>
            <div className="hidden space-x-1 lg:flex" ref={parent}>
              {selectedValues.size > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {selectedValues.size} selected
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </div>
    </Button>
  );
};

function FilterList<TData, TValue>({ radio, column, title, options }: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  return (
    <Command>
      <CommandInput placeholder={title} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value);
                  } else {
                    if (radio) selectedValues.clear();
                    selectedValues.add(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column?.setFilterValue(filterValues?.length ? filterValues : undefined);
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <CheckIcon className={cn("h-4 w-4")} />
                </div>
                {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                <span>{option.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        {selectedValues.size > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={() => column?.setFilterValue(undefined)} className="justify-center text-center">
                Clear filters
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
