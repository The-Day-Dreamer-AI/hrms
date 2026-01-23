export type Leave = {
  id: number;
  user_id: number;
  user_name: string;
  approver_id: number | null;
  approver_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_apply: string;
  reason: string;
  attachment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  half_day: string | null;
  leave_status: string;
  revoker_name: string | null
  approver: Approver;
  revoker: Revoker;
};

type Approver = {
  id: number;
  first_name: string;
  last_name: string
}

type Revoker = {
  id: number;
  first_name: string;
  last_name: string
}