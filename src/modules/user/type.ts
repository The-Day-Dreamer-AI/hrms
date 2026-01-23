import { Branch } from "@/modules/branch/type.ts";

export type User = {
  full_name: string;
  id: number;
  branch_id: number;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  avatar: string;
  phone: string;
  annual_leave: string;
  medical_leave: number;
  maternity_leave: number;
  paternity_leave: number;
  birthday_leave: number;
  joined_date: string;
  deleted_at: string;
  branch: Branch;
  roles: string[];
  remaining_annual_leave: string;
  remaining_medical_leave: number;
  remaining_maternity_leave: number;
  remaining_paternity_leave: number;
  remaining_birthday_leave: number;
};
