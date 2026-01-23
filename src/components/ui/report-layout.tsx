import {ModuleTitle} from "../module-title";
import {DateRangePicker} from "./date-range-picker";
import BranchSelector from "../branch-selector";
import {useState} from "react";
import {CheckboxDropdown} from "./checkbox-dropdown";
import {DateRange} from "react-day-picker";
import {Button} from "./button";

export default function ReportLayout() {
  const [reportStatus, setReportStatus] = useState([]);
  const [branch, setBranch] = useState([]);
  const [leave, setLeave] = useState([]);
  const [date, setDate] = useState<DateRange>();

  return (
    <div className="w-full flex flex-col space-y-2">
      <ModuleTitle>Report</ModuleTitle>

      <div className="gap-2 inline-flex">
        <CheckboxDropdown
          onChange={setReportStatus}
          loadNextPage={() => {}}
          value={reportStatus}
          isLoading={false}
          name={"Status"}
          options={[
            {name: "Approved", value: "approved"},
            {name: "Rejected", value: "rejected"},
            {name: "Pending", value: "pending"},
          ]}
        />
        <CheckboxDropdown
          onChange={setLeave}
          loadNextPage={() => {}}
          value={leave}
          isLoading={false}
          name={"Leave Type"}
          options={[
            {name: "Annual Leave", value: "annual_leave"},
            {name: "Medical Leave", value: "medical_leave"},
            {name: "Maternity Leave", value: "maternity_leave"},
            {name: "Paternity Leave", value: "paternity_leave"},
            {name: "Birthday Leave", value: "birthday_leave"},
          ]}
        />
        <BranchSelector value={branch} onChange={setBranch} />
        <DateRangePicker className="w-fit" setDate={setDate} date={date} />
        <Button size="sm">Generate report</Button>
      </div>
    </div>
  );
}
