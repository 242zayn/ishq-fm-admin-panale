import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import StoryViewPage, {
  StoryViewPageSkeleton,
} from "@/features/stories/components/story-view-page";

export const metadata = {
  title: "Dashboard: Create Story",
};

export default function CreateStoryPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<StoryViewPageSkeleton />}>
          <StoryViewPage storyId="new" />
        </Suspense>
      </div>
    </PageContainer>
  );
}
