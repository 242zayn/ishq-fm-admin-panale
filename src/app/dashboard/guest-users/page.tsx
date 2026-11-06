import PageContainer from "@/components/layout/page-container";
import { searchParamsCache } from "@/lib/searchparams";
import type { SearchParams } from "nuqs/server";
import { guestUsersInfoContent } from "@/features/guest-users/info-content";
import { GuestUserFormSheetTrigger } from "@/features/guest-users/components/user-form-sheet";
import { GuestUsersTable } from "@/features/guest-users/components/users-table";

export const metadata = {
  title: "Dashboard: Guest Users",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function GuestUsersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle="Guest Users"
      pageDescription="Manage guest device sessions, adult content preferences, and activities."
      infoContent={guestUsersInfoContent}
      pageHeaderAction={<GuestUserFormSheetTrigger />}
    >
      <GuestUsersTable />
    </PageContainer>
  );
}
