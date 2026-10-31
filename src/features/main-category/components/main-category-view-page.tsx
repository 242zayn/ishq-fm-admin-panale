'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { useMainCategory } from '../hooks/useMainCategory';
import MainCategoryForm from './main-category-form';

type MainCategoryViewPageProps = Readonly<{
  categoryId: string;
}>;

export default function MainCategoryViewPage({ categoryId }: MainCategoryViewPageProps) {
  if (categoryId === 'new') {
    return <MainCategoryForm initialData={null} pageTitle='Create Main Category' />;
  }

  return <EditMainCategoryView categoryId={categoryId} />;
}

function EditMainCategoryView(props: Readonly<{ categoryId: string }>) {
  const { data, error, isPending } = useMainCategory(props.categoryId);

  if (error) {
    throw error;
  }

  if (isPending) {
    return <Skeleton className='h-96 w-full' />;
  }

  if (!data?.id) {
    notFound();
  }

  return <MainCategoryForm initialData={data} pageTitle={`Edit ${data.title}`} />;
}
