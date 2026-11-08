"use client";

import { useQuery } from "@tanstack/react-query";
import { referralsQueryOptions } from "../api/service";
import type { ReferralFilters } from "../api/types";

export function useReferrals(filters?: ReferralFilters) {
  return useQuery({
    ...referralsQueryOptions(filters),
    enabled: typeof window !== "undefined",
  });
}
