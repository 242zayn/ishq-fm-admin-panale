import PageContainer from '@/components/layout/page-container';
import StoriesListing from '@/features/stories/components/stories-listing';

export const metadata = {
  title: 'Dashboard: Stories'
};

export default function StoriesPage() {
  return (
    <PageContainer
      pageTitle='Stories'
      pageDescription='Browse and search stories from the backend.'
    >
      <StoriesListing />
    </PageContainer>
  );
}
