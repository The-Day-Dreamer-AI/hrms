import { createAclify } from "react-aclify";

export const { CanAccess, useAclify, AclifyProvider, } = createAclify();

export const ROLES = {
  BOSS: "boss",
  DIRECTOR: "director",
  BRANCH_MANAGER: "manager",
  CREDIT_OFFICER: "finance",
  ENGINEER: "engineer",
  HR: "hr",
};

export const ENGINEER_ONLY = [ROLES.BOSS, ROLES.ENGINEER];
export const ADMIN_ONLY = [ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER];
export const ALL = Object.values(ROLES);
export const BAU_ONLY = [ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER, ROLES.ENGINEER];
export const NOT_HR = [ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER, ROLES.BRANCH_MANAGER, ROLES.ENGINEER]

export const ROLE_ID = {
  [ROLES.DIRECTOR]: 1,
  [ROLES.HR]: 2,
  [ROLES.CREDIT_OFFICER]: 3,
  [ROLES.BRANCH_MANAGER]: 4,
  [ROLES.ENGINEER]: 5,
};

export const ROLE_NAME_MAP = {
  "1": "Director",
  "2": "Human Resources",
  "3": "Finance",
  "4": "Branch Manager",
  "5": "Engineer",
};
