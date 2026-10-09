import PageContainer from '@/components/layout/page-container';
import StoryDetail from '@/features/stories/components/story-detail';

export const metadata = {
  title: 'Dashboard: Story Details'
};

type PageProps = {
  params: Promise<{ storyId: string }>;
};

export default async function StoryDetailsPage({ params }: PageProps) {
  const { storyId } = await params;

  return (
    <PageContainer pageTitle='Story Details'>
      <StoryDetail storyId={storyId} />
    </PageContainer>
  );
}
