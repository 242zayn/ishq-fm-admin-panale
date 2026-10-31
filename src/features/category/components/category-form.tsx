'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { useAllMainCategories } from '@/features/main-category/hooks/useMainCategory';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Category } from '../api/types';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategory';
import { categorySchema, type CategoryFormValues } from '../schemas/category';

const mainCategoryIdField = '_id';

type CategoryFormProps = Readonly<{
  initialData: Category | null;
  pageTitle: string;
}>;

export default function CategoryForm({ initialData, pageTitle }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const mainCategoriesQuery = useAllMainCategories();

  if (mainCategoriesQuery.error) {
    throw mainCategoriesQuery.error;
  }

  const assignedMainCategory = initialData?.mainCategory;
  const selectedMainCategoryId =
    typeof assignedMainCategory === 'string'
      ? assignedMainCategory
      : (assignedMainCategory?.id ?? assignedMainCategory?.[mainCategoryIdField] ?? '');
  const mainCategories = mainCategoriesQuery.data ?? [];
  const mainCategoryOptions = [
    { value: 'none', label: 'No main category' },
    ...mainCategories.map((mainCategory) => ({
      value: mainCategory.id,
      label: mainCategory.title
    })),
    ...(selectedMainCategoryId &&
    !mainCategories.some((mainCategory) => mainCategory.id === selectedMainCategoryId)
      ? [
          {
            value: selectedMainCategoryId,
            label:
              typeof assignedMainCategory === 'object' && assignedMainCategory?.title
                ? assignedMainCategory.title
                : 'Current main category'
          }
        ]
      : [])
  ];

  const form = useAppForm({
    defaultValues: {
      mainCategory: selectedMainCategoryId || 'none',
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      bannerImage: initialData?.bannerImage ?? '',
      iconImage: initialData?.iconImage ?? '',
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
      tags: initialData?.tags?.join(', ') ?? ''
    } satisfies CategoryFormValues,
    validators: { onSubmit: categorySchema },
    onSubmit: ({ value }) => {
      const payload = {
        mainCategory: value.mainCategory === 'none' ? null : value.mainCategory,
        title: value.title,
        slug: value.slug,
        description: value.description || undefined,
        bannerImage: value.bannerImage || undefined,
        iconImage: value.iconImage || undefined,
        isActive: value.isActive,
        isFeatured: value.isFeatured,
        sortOrder: value.sortOrder,
        tags: value.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      };

      if (initialData) {
        updateMutation.mutate(
          { id: initialData.id, values: payload },
          {
            onSuccess: () => {
              toast.success('Category updated');
              router.push('/dashboard/category');
            },
            onError: (error) =>
              toast.error(error instanceof Error ? error.message : "Couldn't update category.")
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success('Category created');
            router.push('/dashboard/category');
          },
          onError: (error) =>
            toast.error(error instanceof Error ? error.message : "Couldn't create category.")
        });
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-8'
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <form.AppField name='title'>
                {(field) => <field.TextField label='Title' required placeholder='Category title' />}
              </form.AppField>
              <form.AppField name='slug'>
                {(field) => <field.TextField label='Slug' required placeholder='audio-stories' />}
              </form.AppField>
              <form.AppField name='mainCategory'>
                {(field) => (
                  <field.SelectField
                    label='Main Category'
                    options={mainCategoryOptions}
                    placeholder={
                      mainCategoriesQuery.isPending
                        ? 'Loading main categories...'
                        : 'Select main category'
                    }
                  />
                )}
              </form.AppField>
              <form.AppField name='bannerImage'>
                {(field) => (
                  <field.TextField label='Banner image URL' type='url' placeholder='https://...' />
                )}
              </form.AppField>
              <form.AppField name='iconImage'>
                {(field) => (
                  <field.TextField label='Icon image URL' type='url' placeholder='https://...' />
                )}
              </form.AppField>
              <form.AppField name='sortOrder'>
                {(field) => <field.TextField label='Sort order' type='number' min={0} required />}
              </form.AppField>
              <form.AppField name='tags'>
                {(field) => (
                  <field.TextField
                    label='Tags'
                    placeholder='audio, trending'
                    description='Separate tags with commas.'
                  />
                )}
              </form.AppField>
            </div>
            <form.AppField name='description'>
              {(field) => (
                <field.TextareaField
                  label='Description'
                  rows={4}
                  placeholder='Describe this category'
                />
              )}
            </form.AppField>
            <div className='grid gap-4 md:grid-cols-2'>
              <form.AppField name='isActive'>
                {(field) => (
                  <field.SwitchField
                    label='Active'
                    description='Show this category to users.'
                    compact
                  />
                )}
              </form.AppField>
              <form.AppField name='isFeatured'>
                {(field) => (
                  <field.SwitchField
                    label='Featured'
                    description='Highlight this category.'
                    compact
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <LoadingButton loading={isPending} type='submit'>
              {isEdit ? 'Update Category' : 'Create Category'}
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
