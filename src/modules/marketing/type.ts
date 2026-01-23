import { Website } from "../website/type";

export type MarketingClaims = {
    id: number;
    user_id: number;
    marketing_claim_type_id: number;
    receipt_number: string;
    amount: string;
    date: string;
    attachment?: string;
    remarks: string;
    status: string;
    utilized_limit: string
    marketing_claim_limit: string
    website_url: string
    website_name: string
    website_utilized_limit: string
    website_limit: string
    website: Website
    approver: ApproverType
}

type ApproverType = {
    id: string
    first_name: string
    last_name: string
}