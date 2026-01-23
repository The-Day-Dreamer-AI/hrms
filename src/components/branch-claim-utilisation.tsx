import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/LoginPage.tsx";
import { client } from "@/axios.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/lib/utils.ts";

export default function BranchClaimUtilisation({ showMarketingClaims }: { showMarketingClaims?: boolean }) {
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const roundToDecimalPlaces = (num, decimalPlaces) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  };

  const { data, isLoading } = useQuery({
    enabled: Boolean(user?.branch_id),
    queryKey: ["Get Branch Claim Utils"],
    queryFn: async () => {
      const res = await client.get(`/api/branches/${user?.branch_id}`);
      return {
        marketing_claim_limits: res.data.data.marketing_claim_limits?.map(
          ({ marketing_claim_type_name, limit_amount, utilized_amout }) => ({
            title: marketing_claim_type_name,
            current: Number(limit_amount),
            remaining: roundToDecimalPlaces(Number(limit_amount) - Number(utilized_amout), 2),
          }),
        ),
        claim_limits: res.data.data.claim_limits?.map(({ claim_type_name, limit_amount, utilized_amout }) => ({
          title: claim_type_name,
          current: Number(limit_amount),
          remaining: roundToDecimalPlaces(Number(limit_amount) - Number(utilized_amout), 2),
        })),
      };
    },
  });

  const cardItems = (!showMarketingClaims ? data?.claim_limits : data?.marketing_claim_limits) || [];

  return (
    <div className={cn("flex flex-col space-y-4", !user?.branch_id ? "hidden" : "")}>
      <div
        className={cn(
          !showMore && cardItems?.length > 6 ? "max-h-[160px] overflow-hidden" : "",
          "relative grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4",
        )}
      >
        {cardItems.map(({ title, current, remaining }) => (
          <Card className={"p-4"} key={title}>
            <div className={"flex flex-col space-y-2"}>
              <h1 className={"text-sm font-medium text-muted-foreground"}>{title}</h1>
              <span className={"text-lg font-bold"}>
                <span className={"text-2xl"}>{Number(remaining)}</span>/{Number(current)}
              </span>
              <Progress value={(Number(remaining) / Number(current)) * 100} />
            </div>
          </Card>
        ))}
        {cardItems.length > 6 && (
          <div
            className={cn(
              "absolute left-0 w-full h-[90px]",
              showMore ? "-bottom-10" : "from-background bg-gradient-to-t to-transparent bottom-0",
            )}
          >
            <div className={"w-full flex h-full flex-col items-center justify-end"}>
              <Button size={"sm"} className={"h-6"} variant={"secondary"} onClick={() => setShowMore(!showMore)}>
                {showMore ? "Show Less" : "Show More"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className={"text-sm italic text-muted-foreground"}>This is your branch claims utilisation*</p>
    </div>
  );
}
