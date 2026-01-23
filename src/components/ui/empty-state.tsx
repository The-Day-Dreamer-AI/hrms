import { Loader2, Loader2Icon } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/gSkEwa1TR0p
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Card className="text-start space-y-1 max-w-sm p-4">
        <span className={"flex space-x-2"}>
          <Loader2Icon className="animate-spin" />
          <h3 className="font-bold">Work in Progress</h3>
        </span>
        <p className="text-muted-foreground text-sm">
          We're working hard to bring you something amazing. Please check back
          later!
        </p>
      </Card>
    </div>
  );
}
