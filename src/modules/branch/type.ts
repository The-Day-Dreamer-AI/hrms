export type Branch = {
  id: number;
  name: string;
  created_at: string;
  claim_limits: {
    claim_type_id: number;
    claim_type_name: string;
    limit_amount: string;
  }[];
  team_name: string;
};