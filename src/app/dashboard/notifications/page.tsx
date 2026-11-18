import PageContainer from '@/components/layout/page-container';
import NotificationsListingPage from '@/features/notifications/components/notifications-listing';
import { NotificationsHeaderActions } from '@/features/notifications/components/send-notification-sheet';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Notifications'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function NotificationsDashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Notifications'
      pageDescription='View in-app notifications and broadcast push alerts to mobile devices.'
      pageHeaderAction={<NotificationsHeaderActions />}
    >
      <NotificationsListingPage />
    </PageContainer>
  );
}
