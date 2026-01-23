import {ClaimTypes} from '@/modules/claim-types/type';

export type Claim = {
  id: number;
  user_id: number;
  claim_type_id: number;
  receipt_number: string;
  amount: string;
  date: string;
  attachment: string;
  attachment2?: string;
  remarks: string;
  status: string;
  utilized_limit: string;
  claim_limit: string;
  claim_type: ClaimTypes | string;
  claim_type_name: string;
  approver: Approver;
};


type Approver = {
  id: number;
  first_name: string;
  last_name: string
}