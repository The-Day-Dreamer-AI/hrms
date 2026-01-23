export enum LeaveTypes {
  // For native enums, you can alternatively define a backed enum to set a custom label
  annual_leave = "Annual Leave",
  medical_leave = "Medical Leave",
  maternity_leave = "Maternity Leave",
  paternity_leave = "Paternity Leave",
  birthday_leave = "Birthday Leave",
  compassionate_leave = "Compassionate Leave",
  unpaid_leave = "Unpaid Leave",
  other_leave = "Other Leave",
}

export enum DayCoverage {
  full_day = "Full Day",
  am = "AM",
  pm = "PM",
}

export enum LeaveStatus {
  Approved = "approved",
  Pending = "pending",
  Rejected = "rejected",
  Revoked = "revoked",
  Cancelled = "cancelled",
}
