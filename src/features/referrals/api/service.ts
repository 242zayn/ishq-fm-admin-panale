import { apiClient } from "@/lib/api-client";
import { queryOptions } from "@tanstack/react-query";
import type { Referral, ReferralFilters, ReferralsResponse } from "./types";

export const referralResource = {
  getReferrals: async (params: ReferralFilters = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.set("page", String(params.page));
    }
    if (params.limit !== undefined) {
      searchParams.set("limit", String(params.limit));
    }
    if (params.search) {
      searchParams.set("search", params.search);
    }
    if (params.referrerId) {
      searchParams.set("referrerId", params.referrerId);
    }
    if (params.referredUserId) {
      searchParams.set("referredUserId", params.referredUserId);
    }
    if (params.referralCode) {
      searchParams.set("referralCode", params.referralCode);
    }
    if (params.status) {
      searchParams.set("status", params.status);
    }
    if (params.rewardDays !== undefined) {
      searchParams.set("rewardDays", String(params.rewardDays));
    }

    const query = searchParams.toString();
    const response = await apiClient<ReferralsResponse>(
      `/backend/referrals${query ? `?${query}` : ""}`,
    );

    return response;
  },
};

export const referralKeys = {
  all: ["referrals"] as const,
  lists: () => [...referralKeys.all, "list"] as const,
  list: (filters?: ReferralFilters) =>
    [...referralKeys.lists(), filters ?? {}] as const,
};

export const referralsQueryOptions = (filters?: ReferralFilters) =>
  queryOptions({
    queryKey: referralKeys.list(filters),
    queryFn: () => referralResource.getReferrals(filters),
  });
