import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import StoryViewPage, {
  StoryViewPageSkeleton,
} from "@/features/stories/components/story-view-page";

export const metadata = {
  title: "Dashboard: Edit Story",
};

type PageProps = Readonly<{
  params: Promise<{ storyId: string }>;
}>;

export default async function EditStoryPage(props: PageProps) {
  const { storyId } = await props.params;

  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<StoryViewPageSkeleton />}>
          <StoryViewPage storyId={storyId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
