import dayjs from "dayjs";
import { DownloadCloud } from "lucide-react";

import { useState } from "react";
import { DateRange } from "react-day-picker";

import { useMutation, useQuery } from "@tanstack/react-query";

import { client } from "@/axios";
import BranchSelector from "@/components/branch-selector";
import MarketingClaimTypesSelector from "@/components/marketing-claim-types-selector";
import { ModuleTitle } from "@/components/module-title";
import { ProcessedBar } from "@/components/processed-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxDropdown } from "@/components/ui/checkbox-dropdown";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/ui/data-table/data-table-provider";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/components/ui/use-toast";
import { statusSelections } from "@/constants";
import { useTableStates } from "@/hooks/useTableStates";

import { columns } from "../marketing/columns";

export default function MarketingClaimsReport() {
  const [reportStatus, setReportStatus] = useState([]);
  const [branch, setBranch] = useState([]);
  const [claim, setClaim] = useState([]);
  const [date, setDate] = useState<DateRange>();
  const [fileLink, setFileLink] = useState("");
  const { toast } = useToast();

  function disableGenerate() {
    return reportStatus.length === 0 || claim.length === 0 || !date?.from || !date?.to;
  }

  const queryParams = () => ({
    status: reportStatus.join(","),
    branch_id: branch.join(","),
    claim_type_id: claim.join(","),
    date_from: dayjs(date.from).format("YYYY-MM-DD"),
    date_to: dayjs(date.to).format("YYYY-MM-DD"),
  });

  const { mutateAsync: onSetProcessed, isPending: isProcessing } = useMutation({
    mutationKey: ["process-user-claims"],
    mutationFn: async (ids: string[]) => {
      const res = await client.post("/api/user-marketing-claims/process-payment", { ids });
      return res;
    },
    onError(e) {
      toast({
        title: "Oops, something went wrong.",
        description: (e as any)?.response.data.message,
      });
    },
    onSuccess(_, variables) {
      toast({
        title: "Processing is successfull",
        description: `${variables?.length} items processed.`,
      });
      setRowSelectionState({});
      fetchTable();
      refetch();
    },
  });

  const { refetch, isLoading } = useQuery({
    queryKey: ["marketing-claims-reports-export"],
    enabled: false,
    queryFn: async () => {
      const res = await client.get("/api/reports/export-marketing-claims", {
        responseType: "arraybuffer",
        params: queryParams(),
      });
      const type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const url = window.URL.createObjectURL(new Blob([res.data], { type }));
      setFileLink(url);
      return res;
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
    queryKey: ["marketing_claim", pagination, sorting],
    queryFn: async () => {
      const res = await client.get("/api/reports/marketing-claims", {
        params: queryParams(),
      });

      return {
        data: res?.data?.data,
        total: res?.data?.total,
      };
    },
  });
  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-col space-y-1">
        <ModuleTitle>Marketing Claims Report</ModuleTitle>
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
          options={statusSelections.map((status) => {
            const { label, value } = status;
            return { name: label, value };
          })}
        />
        <MarketingClaimTypesSelector onChange={setClaim} value={claim} />
        <BranchSelector value={branch} onChange={setBranch} />
        <DateRangePicker className="w-fit" setDate={setDate} date={date} />
        <div className="flex space-x-2 ml-auto">
          {fileLink && (
            <Button disabled={isLoading || isTableLoading} variant="outline" size="sm">
              <a href={fileLink} download className="flex items-center">
                <DownloadCloud size={12} className="mr-2" /> Download File
              </a>
            </Button>
          )}
          <Button
            disabled={isLoading || isTableLoading || disableGenerate()}
            size="sm"
            onClick={() => {
              fetchTable();
              refetch();
            }}
          >
            Generate report
          </Button>
        </div>
      </Card>

      {!isTableLoading && !isLoading && queryData?.data.length > 0 && (
        <Card className="overflow-x-auto">
          <DataTableProvider
            data={queryData?.data || []}
            isLoading={isLoading || isTableLoading}
            columns={columns({
              enableSelection: true,
              enableEdit: false,
              refetch: () => {},
            })}
            tableSetting={{
              enableRowSelection: true,
              rowCount: queryData?.total,
              getRowId: (a) => a?.marketing_claim_id?.toString(),
              onColumnFiltersChange: setColumnFilters,
              onPaginationChange: setPagination,
              onSortingChange: setSorting,
              onRowSelectionChange: setRowSelectionState,
              manualPagination: true,
              manualFiltering: true,
              state: {
                pagination: { ...pagination, pageSize: 50 },
                columnFilters,
                rowSelection,
                sorting,
              },
            }}
          >
            <DataTable />
            <DataTablePagination />
          </DataTableProvider>
        </Card>
      )}
      <ProcessedBar
        showBar={Boolean(Object.keys(rowSelection).length)}
        id={Object.keys(rowSelection)}
        isLoading={isProcessing}
        onClose={() => setRowSelectionState({})}
        onSubmit={(id) => onSetProcessed(id)}
      />
    </div>
  );
}
