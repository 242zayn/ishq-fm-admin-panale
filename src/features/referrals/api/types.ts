export type ReferralStatus =
  "pending" | "qualified" | "rewarded" | (string & {});

export type Referral = {
  id: string;
  _id?: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: ReferralStatus;
  rewardDays: number;
  createdAt: string;
  updatedAt: string;
  qualifiedAt?: string | null;
  rewardedAt?: string | null;
  __v?: number;
};

export type ReferralFilters = {
  page?: number;
  limit?: number;
  search?: string;
  referrerId?: string;
  referredUserId?: string;
  referralCode?: string;
  status?: ReferralStatus;
  rewardDays?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ReferralsResponse = {
  message: string;
  data: Referral[];
  meta: {
    pagination: PaginationMeta;
  };
};
