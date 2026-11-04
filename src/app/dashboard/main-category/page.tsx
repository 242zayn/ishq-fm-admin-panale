import { Icons } from "@/components/icons";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import MainCategoryListingPage from "@/features/main-category/components/main-category-listing";
import { searchParamsCache } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SearchParams } from "nuqs/server";

export const metadata = {
  title: "Dashboard: Category Manage",
};

type PageProps = Readonly<{
  searchParams: Promise<SearchParams>;
}>;

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const AddIcon = Icons.add;

  return (
    <PageContainer
      pageTitle="Category Manage"
      pageDescription="Organize main categories and assign child categories with drag-and-drop."
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/main-category/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-9 rounded-lg px-3.5 text-xs font-medium md:text-sm shadow-sm",
            )}
          >
            <AddIcon className="mr-1.5 h-4 w-4" /> Add Category
          </Link>
        </div>
      }
    >
      <MainCategoryListingPage />
    </PageContainer>
  );
}
