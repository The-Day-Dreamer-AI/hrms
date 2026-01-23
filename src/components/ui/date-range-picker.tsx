"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date?: DateRange;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            size="sm"
            variant={"outline"}
            className={cn("w-[250px] h-10 justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side={"bottom"}>
          <Calendar
            initialFocus
            mode="range"
            className={"hidden md:block"}
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <Calendar
            initialFocus
            mode="range"
            className={"block md:hidden"}
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
