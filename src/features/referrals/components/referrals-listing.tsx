import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralsTable } from "./referrals-table";

export default function ReferralsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ReferralsTable />
    </Suspense>
  );
}
