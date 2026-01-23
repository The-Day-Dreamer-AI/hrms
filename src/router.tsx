import {Navigate, createBrowserRouter} from "react-router-dom";
import {MainLayout} from "@/components/layout";
import {OverviewPage} from "@/modules/overview/pages/OverviewPage";
import {BranchListing} from "@/modules/branch/pages/BranchListing.tsx";
import {BranchDetails} from "./modules/branch/pages/BranchDetails";
import {TeamListing} from "@/modules/team/pages/TeamListing.tsx";
import {TeamDetails} from "./modules/team/pages/TeamDetails";
import {UserListing} from "./modules/user/pages/UserListing";
import {UserDetail} from "./modules/user/pages/UserDetail";
import {LeaveListing} from "@/modules/leave/pages/LeaveListing.tsx";
import {LeaveDetails} from "@/modules/leave/pages/LeaveDetails.tsx";
import {ClaimListing} from "@/modules/claim/pages/ClaimListing.tsx";
import {ClaimDetails} from "@/modules/claim/pages/ClaimDetails.tsx";
import {ClaimTypesListing} from "@/modules/claim-types/pages/ClaimTypesListing.tsx";
import {ClaimTypesDetails} from "@/modules/claim-types/pages/ClaimTypesDetails.tsx";
import {MarketingTypesListing} from "@/modules/marketing-types/pages/MarketingTypesListing.tsx";
import {MarketingTypesDetails} from "@/modules/marketing-types/pages/MarketingTypesDetails.tsx";
import {AgencyListing} from "@/modules/agency/pages/AgencyListing.tsx";
import {AgencyDetails} from "@/modules/agency/pages/AgencyDetails.tsx";
import {MarketingListing} from "./modules/marketing/pages/MarketingListing";
import {MarketingDetails} from "./modules/marketing/pages/MarketingDetails";
import ClaimsReport from "./modules/claims-reports";
import LeaveReports from "./modules/leave-reports";
import MarketingClaimsReport from "./modules/marketing-claims-reports";
import {CanAccess, ROLES} from "./acl";
import React from "react";
import { WebsiteDetails } from "./modules/website/pages/WebsiteDetails";
import { WebsiteListing } from "./modules/website/pages/WebsiteListing";

function NoAccess({
  children,
  roles,
}: {
  children: React.ReactElement;
  roles: string[];
}) {
  return (
    <CanAccess
      roles={roles}
      fallback={
        <div className="h-[80vh] items-center justify-center flex">
          404 | No page found
        </div>
      }
    >
      {children}
    </CanAccess>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {path: "overview", element: <OverviewPage />},
      {
        path: "branch",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER, ROLES.HR]}>
                <BranchListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <BranchDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "team",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <TeamListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <TeamDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "website",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <WebsiteListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <WebsiteDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "user",
        children: [
          {
            path: "",
            element: (
              <NoAccess
                roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.BRANCH_MANAGER, ROLES.HR]}
              >
                <UserListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess
                roles={[ROLES.BOSS, ROLES.HR, ROLES.DIRECTOR]}
              >
                <UserDetail />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "leave",
        children: [
          {path: "", element: <LeaveListing />},
          {path: "create", element: <LeaveDetails />},
        ],
      },
      {
        path: "claim",
        children: [
          {path: "", element: <ClaimListing />},
          {path: "create", element: <ClaimDetails />},
        ],
      },
      {
        path: "claim-types",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <ClaimTypesListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <ClaimTypesDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "marketing",
        children: [
          {path: "", element: <MarketingListing />},
          {path: "create", element: <MarketingDetails />},
        ],
      },
      {
        path: "marketing-types",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <MarketingTypesListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <MarketingTypesDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "agency",
        children: [
          {
            path: "",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <AgencyListing />
              </NoAccess>
            ),
          },
          {
            path: "create",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <AgencyDetails />
              </NoAccess>
            ),
          },
        ],
      },
      {
        path: "reports",
        children: [
          {
            path: "leave",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.HR]}>
                <LeaveReports />
              </NoAccess>
            ),
          },
          {
            path: "claims",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <ClaimsReport />
              </NoAccess>
            ),
          },
          {
            path: "marketing-claims",
            element: (
              <NoAccess roles={[ROLES.BOSS, ROLES.DIRECTOR, ROLES.CREDIT_OFFICER]}>
                <MarketingClaimsReport />
              </NoAccess>
            ),
          },
        ],
      },
      {path: "", element: <Navigate to="/overview" />},
    ],
  },
]);
