'use client';

import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategory } from '../hooks/useCategory';
import CategoryForm from './category-form';

type CategoryViewPageProps = Readonly<{
  categoryId: string;
}>;

export default function CategoryViewPage({ categoryId }: CategoryViewPageProps) {
  if (categoryId === 'new') {
    return <CategoryForm initialData={null} pageTitle='Create Category' />;
  }

  return <EditCategoryView categoryId={categoryId} />;
}

function EditCategoryView(props: Readonly<{ categoryId: string }>) {
  const { data, error, isPending } = useCategory(props.categoryId);

  if (error) {
    throw error;
  }

  if (isPending) {
    return <Skeleton className='h-96 w-full' />;
  }

  if (!data?.id) {
    notFound();
  }

  return <CategoryForm initialData={data} pageTitle={`Edit ${data.title}`} />;
}
