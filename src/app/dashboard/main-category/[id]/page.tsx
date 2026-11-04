import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/layout/page-container";
import MainCategoryViewPage from "@/features/main-category/components/main-category-view-page";

export const metadata = {
  title: "Dashboard: Category Management",
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <Suspense
          fallback={
            <div className="space-y-4 p-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <Skeleton className="h-[600px] rounded-2xl lg:col-span-7" />
                <Skeleton className="h-[600px] rounded-2xl lg:col-span-5" />
              </div>
            </div>
          }
        >
          <MainCategoryViewPage categoryId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
