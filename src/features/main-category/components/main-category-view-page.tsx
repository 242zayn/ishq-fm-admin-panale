"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { useMainCategory } from "../hooks/useMainCategory";
import MainCategoryForm from "./main-category-form";
import { AssignCategoriesWorkspace } from "./assign-categories/assign-categories-workspace";

type MainCategoryViewPageProps = Readonly<{
  categoryId: string;
}>;

export default function MainCategoryViewPage({
  categoryId,
}: MainCategoryViewPageProps) {
  if (categoryId === "new") {
    return (
      <MainCategoryForm initialData={null} pageTitle="Create Main Category" />
    );
  }

  return <MainCategoryWorkspaceView categoryId={categoryId} />;
}

function MainCategoryWorkspaceView(props: Readonly<{ categoryId: string }>) {
  const { data, error, isPending } = useMainCategory(props.categoryId);

  if (error) {
    throw error;
  }

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-[600px] rounded-2xl lg:col-span-7" />
          <Skeleton className="h-[600px] rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (!data?.id) {
    notFound();
  }

  return <AssignCategoriesWorkspace mainCategory={data} />;
}
