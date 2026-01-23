import { Agency } from '@/modules/agency/type';

export type Website = {
  id: number;
  name: string;
  url: string;
  default_limit: number;
  agency_id: number;
  created_at: string;
  agency: Agency;
};