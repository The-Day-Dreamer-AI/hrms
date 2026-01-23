import {CanAccess, ROLES} from "@/acl";
import {client} from "@/axios";
import {Badge} from "@/components/ui/badge";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {ClaimStatusUpdateItem} from "@/modules/claim/columns";
import {LeaveStatusUpdateItem} from "@/modules/leave/columns";
import {ClaimStatusUpdateItem as MarkingClaimStatusUpdateItem} from "@/modules/marketing/columns";

import {useQuery} from "@tanstack/react-query";
import React from "react";
import {Link} from "react-router-dom";

export function OverviewPage() {
  const {data, isLoading, refetch} = useQuery({
    queryKey: ["pending-approval"],
    queryFn: async () => {
      const res = await client.get("/api/dashboard/pending-approval");
      return await res?.data;
    },
  });

  const {data: onLeave, isLoading: onLeaveIsLoading} = useQuery({
    queryKey: ["on-leaves"],
    queryFn: async () => {
      const data = await client.get("/api/dashboard/on-leaves");
      return await data.data;
    },
  });

  return (
    <>
      <main className="grid grid-cols-3 gap-4">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Who's away ?</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
              {onLeaveIsLoading ? (
                <LoadingCards />
              ) : onLeave?.data?.length === 0 ? (
                <div className="col-span-3 border-2 border-dashed rounded-lg min-h-40 flex items-center justify-center text-muted-foreground">
                  Seems like no one is away.
                </div>
              ) : (
                onLeave?.data?.map(
                  ({id, user, leave_type, start_date, end_date}) => (
                    <Card
                      className="flex flex-col gap-1 px-4 py-2 justify-between"
                      key={id}
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate">
                          <span>{user.first_name}</span>
                          {user.last_name}
                        </p>
                      </div>
                      <div className="flex gap-2 items-end justify-between">
                        <div className="flex flex-col">
                          <span className="max-w-[500px] text-start truncate text-sm text-muted-foreground font-medium capitalize">
                            {leave_type?.replace("_", " ")}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({start_date}-{end_date})
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>

        <CanAccess roles={[ROLES.DIRECTOR, ROLES.HR]}>
          <Card className="col-span-3 sm:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Claims</CardTitle>
                <Link
                  to={"/claim"}
                  className={cn(
                    buttonVariants({variant: "secondary", size: "sm"})
                  )}
                >
                  View claims
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="flex flex-col space-y-1 max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <LoadingCards />
                ) : data?.["pending_claims"] === 0 ? (
                  <EmptyState />
                ) : (
                  data?.["pending_claims"]?.map(
                    ({user_name, id, amount, status, branch_name}) => (
                      <Card
                        className="flex flex-col gap-1 px-4 py-2 justify-between"
                        key={id}
                      >
                        <div className="flex items-center justify-between">
                          <p className="truncate">
                            {user_name}
                            <Badge className="ms-2">{branch_name}</Badge>
                          </p>
                        </div>
                        <div className="flex gap-2 justify-end items-center">
                          <p className="text-sm text-muted-foreground">
                            RM {amount}
                          </p>
                          <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR]}>
                            <ClaimStatusUpdateItem
                              currentValue={status}
                              refetch={refetch}
                              id={id}
                            />
                          </CanAccess>
                        </div>
                      </Card>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </CanAccess>

        <CanAccess roles={[ROLES.DIRECTOR, ROLES.HR]}>
          <Card className="col-span-3 sm:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Marketing Claims</CardTitle>
                <Link
                  to={"/marketing"}
                  className={cn(
                    buttonVariants({variant: "secondary", size: "sm"})
                  )}
                >
                  View claims
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="flex flex-col pe-3 space-y-1 max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <LoadingCards />
                ) : data?.["pending_marketing_claims"] === 0 ? (
                  <EmptyState />
                ) : (
                  data?.["pending_marketing_claims"]?.map(
                    ({user_name, id, amount, status, branch_name}) => (
                      <Card
                        className="flex flex-col gap-1 px-4 py-2 justify-between"
                        key={id}
                      >
                        <div className="flex items-center justify-between">
                          <p className="truncate">
                            {user_name}
                            <Badge className="ms-2">{branch_name}</Badge>
                          </p>
                        </div>
                        <div className="flex gap-2 justify-end items-center">
                          <p className="text-sm text-muted-foreground">
                            RM {amount}
                          </p>
                          <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR]}>
                            <MarkingClaimStatusUpdateItem
                              currentValue={status}
                              refetch={refetch}
                              id={id}
                            />
                          </CanAccess>
                        </div>
                      </Card>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </CanAccess>

        <CanAccess roles={[ROLES.DIRECTOR, ROLES.HR]}>
          <Card className="col-span-3 sm:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Leaves</CardTitle>
                <Link
                  to={"/leave"}
                  className={cn(
                    buttonVariants({variant: "secondary", size: "sm"})
                  )}
                >
                  View leaves
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="flex flex-col pe-3 space-y-1 max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <LoadingCards />
                ) : data?.["pending_leaves"]?.length === 0 ? (
                  <EmptyState />
                ) : (
                  data?.["pending_leaves"]?.map(
                    ({
                      user_name,
                      id,
                      leave_type,
                      status,
                      branch_name,
                      start_date,
                      end_date,
                    }) => (
                      <Card
                        className="flex flex-col gap-1 px-4 py-2 justify-between"
                        key={id}
                      >
                        <div className="flex items-center justify-between">
                          <p className="truncate">
                            {user_name}
                            <Badge className="ms-2">{branch_name}</Badge>
                          </p>
                        </div>
                        <div className="flex gap-2 items-end justify-between">
                          <div className="flex flex-col">
                            <span className="max-w-[500px] text-start truncate text-sm text-muted-foreground font-medium capitalize">
                              {leave_type?.replace("_", " ")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({start_date}-{end_date})
                            </span>
                          </div>
                          <CanAccess roles={[ROLES.BOSS, ROLES.DIRECTOR]}>
                            <LeaveStatusUpdateItem
                              currentValue={status}
                              refetch={refetch}
                              id={id}
                            />
                          </CanAccess>
                        </div>
                      </Card>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </CanAccess>
      </main>
    </>
  );
}

function LoadingCards() {
  return (
    <React.Fragment>
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="min-h-[70px] bg-muted"></Card>
      ))}
    </React.Fragment>
  );
}

function EmptyState() {
  return (
    <div className="h-[400px] text-sm flex items-center justify-center border-2 rounded-md border-dashed text-muted-foreground">
      No actions required
    </div>
  );
}
