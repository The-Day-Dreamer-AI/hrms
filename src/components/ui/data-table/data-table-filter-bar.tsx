import { Trash2Icon } from "lucide-react";

import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import { Button } from "../button";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useDataTable } from "./data-table-provider";

export function DataTableFilterBar<TData, TValue>({
  filters = [],
}: {
  filters?: {
    isDateRange?: boolean;
    radio?: boolean;
    key: string;
    title: string;
    datePicker?: boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { value: string; label: string; icon: any }[];
  }[];
}) {
  const { table } = useDataTable<TData, TValue>();
  const isFiltered = table.getState().columnFilters.length > 0;
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [claimDate, setClaimDate] = useState<Date | undefined>(undefined);
  const [leaveDateFilter, setLeaveDateFilter] = useState<{ from?: Date; to?: Date } | undefined>(undefined);

  const handleDateRangeChange = (newDateRange: DateRange | undefined, key: string) => {
    setDateRange(newDateRange);
    if (newDateRange?.from && newDateRange?.to) {
      table.getColumn(key)?.setFilterValue({
        from: newDateRange.from,
        to: newDateRange.to,
      });
    } else {
      table.getColumn(key)?.setFilterValue({
        from: undefined,
        to: undefined,
      });
    }
  };

  const handleDateChange = (newDate: Date | undefined, key: string) => {
    setClaimDate(newDate);
    if (newDate) {
      table.getColumn(key)?.setFilterValue(newDate);
    } else {
      table.getColumn(key)?.setFilterValue(undefined);
    }
  };

  useEffect(() => {
    const leaveDateFilter = table.getState().columnFilters.find((filter) => filter.id === "days_apply");
    const claimDateFilter = table.getState().columnFilters.find((filter) => filter.id === "date");

    if (claimDateFilter) {
      setClaimDate(claimDateFilter?.value as Date);
    } else {
      setClaimDate(undefined);
    }

    if (leaveDateFilter) {
      setLeaveDateFilter(leaveDateFilter.value);
    } else {
      setLeaveDateFilter({
        from: undefined,
        to: undefined,
      });
    }
  }, [table.getState().columnFilters]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map(({ key, options, title, radio, isDateRange, datePicker }) => {
        if (isDateRange) {
          return (
            <React.Fragment key={key}>
              <DateRangePicker
                date={dateRange}
                setDate={(newDateRange: DateRange | undefined) => handleDateRangeChange(newDateRange, key)}
                className="w-[250px]"
              />
            </React.Fragment>
          );
        }

        if (datePicker) {
          return (
            <React.Fragment key={key}>
              <div className="grid gap-2 w-[250px]">
                <DatePicker date={claimDate} setDate={(newDate: Date | undefined) => handleDateChange(newDate, key)} />
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={key}>
            {table.getColumn(key) ? (
              <DataTableFacetedFilter radio={radio} column={table.getColumn(key)} title={title} options={options} />
            ) : null}
          </React.Fragment>
        );
      })}
      {isFiltered && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.resetColumnFilters();
            setDateRange(undefined);
          }}
          className="w-9 md:w-auto p-2 md:p-auto"
        >
          <Trash2Icon className="me-auto md:me-2 h-4 w-4" />
          <span className="hidden md:block">Reset Filters</span>
        </Button>
      )}
    </div>
  );
}
