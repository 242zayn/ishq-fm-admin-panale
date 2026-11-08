import PageContainer from "@/components/layout/page-container";
import ReferralsListingPage from "@/features/referrals/components/referrals-listing";
import { searchParamsCache } from "@/lib/searchparams";
import type { SearchParams } from "nuqs/server";

export const metadata = {
  title: "Dashboard: Referrals",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ReferralPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle="Referrals"
      pageDescription="View and track user referrals, statuses, and rewarded subscriptions."
    >
      <ReferralsListingPage />
    </PageContainer>
  );
}
