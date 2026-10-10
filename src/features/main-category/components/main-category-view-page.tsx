'use client';

import { notFound } from 'next/navigation';
import { useMainCategory } from '../api/hooks';
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
  const { data } = useMainCategory(props.categoryId);

  if (!data?.id) {
    notFound();
  }

  return <MainCategoryForm initialData={data} pageTitle={`Edit ${data.title}`} />;
}
