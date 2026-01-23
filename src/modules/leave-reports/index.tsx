import dayjs from "dayjs";
import { DownloadCloud } from "lucide-react";

import { useState } from "react";
import { DateRange } from "react-day-picker";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/axios";
import BranchSelector from "@/components/branch-selector";
import { ModuleTitle } from "@/components/module-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxDropdown } from "@/components/ui/checkbox-dropdown";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/ui/data-table/data-table-provider";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { LeaveStatusOptions } from "@/constants";
import { useTableStates } from "@/hooks/useTableStates";

import { approveLeave } from "../leave/columns";
import { LeaveTypes } from "../leave/constants";

const fromEnumToObject = () => {
  const names = Object.values(LeaveTypes);
  const values = Object.keys(LeaveTypes);
  return names.map((name, i) => ({ name, value: values[i] }));
};

export default function LeaveReports() {
  const [reportStatus, setReportStatus] = useState([]);
  const [branch, setBranch] = useState([]);
  const [leave, setLeave] = useState([]);
  const [date, setDate] = useState<DateRange>();
  const [fileLink, setFileLink] = useState("");
  const [unpaidFileLink, setUnpaidFileLink] = useState("");

  const queryParams = () => ({
    status: reportStatus.join(","),
    branch_id: branch.join(","),
    leave_type: leave.join(","),
    date_from: dayjs(date.from).format("YYYY-MM-DD"),
    date_to: dayjs(date.to).format("YYYY-MM-DD"),
  });

  function disableGenerate() {
    return reportStatus.length === 0 || leave.length === 0 || !date?.from || !date?.to;
  }

  const { refetch, isLoading } = useQuery({
    queryKey: ["leave-reports"],
    enabled: false,
    queryFn: async () => {
      const res = await client.get("/api/reports/export-leaves", {
        responseType: "arraybuffer",
        params: queryParams(),
      });
      const unpaidRes = await client.get("/api/reports/export-unpaid-leaves", {
        responseType: "arraybuffer",
        params: queryParams(),
      });
      const type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const url = window.URL.createObjectURL(new Blob([res.data], { type }));
      const unpaidUrl = window.URL.createObjectURL(new Blob([unpaidRes.data], { type }));

      setFileLink(url);
      setUnpaidFileLink(unpaidUrl);
      return [res, unpaidRes];
    },
  });

  const {
    columnFilters,
    pagination,
    setColumnFilters,
    setPagination,
    setSorting,
    rowSelection,
    setRowSelectionState,
    sorting,
  } = useTableStates();

  const {
    isLoading: isTableLoading,
    data: queryData,
    refetch: fetchTable,
  } = useQuery({
    enabled: false,
    queryKey: ["leave-report-tables", pagination, sorting],
    queryFn: async () => {
      const res = await client.get("/api/reports/leaves", {
        params: queryParams(),
      });

      return {
        raw_data: res?.data?.data,
        data: res?.data?.data,
        total: res?.data?.total,
      };
    },
  });

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-col space-y-1">
        <ModuleTitle>Leave Report</ModuleTitle>
        <p className="text-sm text-muted-foreground">Select the filters to generate excel report</p>
      </div>

      <Card className="gap-2 flex flex-wrap p-2 sm:px-4 items-center">
        <p className="text-sm text-muted-foreground">Filters</p>
        <CheckboxDropdown
          onChange={setReportStatus}
          loadNextPage={() => {}}
          value={reportStatus}
          isLoading={false}
          name={"Status"}
          options={LeaveStatusOptions.map((status) => {
            const { label, value } = status;
            return { name: label, value };
          })}
        />
        <CheckboxDropdown
          onChange={setLeave}
          loadNextPage={() => {}}
          value={leave}
          isLoading={false}
          name={"Leave Type"}
          options={fromEnumToObject()}
        />
        <BranchSelector value={branch} onChange={setBranch} />
        <DateRangePicker className="w-fit" setDate={setDate} date={date} />
        <div className="flex space-x-2 ml-auto">
          {fileLink && (
            <Button disabled={isLoading || isTableLoading} variant="outline" size="sm">
              <a href={fileLink} download className="flex items-center">
                <DownloadCloud size={12} className="mr-2" /> Download Balance Leave Report
              </a>
            </Button>
          )}

          {unpaidFileLink && (
            <Button disabled={isLoading || isTableLoading} variant="outline" size="sm">
              <a href={unpaidFileLink} download className="flex items-center">
                <DownloadCloud size={12} className="mr-2" /> Download Unpaid Leave Report
              </a>
            </Button>
          )}
          <Button
            disabled={isLoading || disableGenerate() || isTableLoading}
            size="sm"
            onClick={() => {
              refetch();
              fetchTable();
            }}
          >
            Generate report
          </Button>
        </div>
      </Card>

      {queryData?.data.length > 0 && !isTableLoading && !isLoading && (
        <Card className="overflow-x-auto">
          <DataTableProvider
            data={queryData?.data || []}
            isLoading={isLoading || isTableLoading}
            columns={approveLeave({ enableSelection: false, refetch: () => {} })}
            tableSetting={{
              rowCount: queryData?.total,
              getRowId: (a) => a.id?.toString(),
              state: {
                columnFilters,
                pagination: { ...pagination, pageSize: 50 },
                sorting,
                rowSelection,
              },
              onColumnFiltersChange: setColumnFilters,
              onPaginationChange: setPagination,
              onSortingChange: setSorting,
              onRowSelectionChange: setRowSelectionState,
              manualPagination: true,
              manualSorting: true,
            }}
          >
            <DataTable />
            <DataTablePagination />
          </DataTableProvider>
        </Card>
      )}
    </div>
  );
}
