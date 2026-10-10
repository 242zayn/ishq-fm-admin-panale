'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { MainCategory } from '../api/types';
import { mainCategorySchema, type MainCategoryFormValues } from '../schemas/main-category';
import { useCreateMainCategory, useUpdateMainCategory } from '../hooks/useMainCategory';

type MainCategoryFormProps = Readonly<{
  initialData: MainCategory | null;
  pageTitle: string;
}>;

export default function MainCategoryForm({ initialData, pageTitle }: MainCategoryFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useCreateMainCategory();
  const updateMutation = useUpdateMainCategory();

  const handleCreateSuccess = () => {
    toast.success('Main category created');
    router.push('/dashboard/main-category');
  };

  const handleUpdateSuccess = () => {
    toast.success('Main category updated');
    router.push('/dashboard/main-category');
  };

  const form = useAppForm({
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      bannerImage: initialData?.bannerImage ?? '',
      iconImage: initialData?.iconImage ?? '',
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
      tags: initialData?.tags?.join(', ') ?? ''
    } satisfies MainCategoryFormValues,
    validators: {
      onSubmit: mainCategorySchema
    },
    onSubmit: ({ value }) => {
      const payload = {
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
            onSuccess: handleUpdateSuccess,
            onError: (error) =>
              toast.error(
                error instanceof Error ? error.message : "Couldn't update main category. Try again."
              )
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: handleCreateSuccess,
          onError: (error) =>
            toast.error(
              error instanceof Error ? error.message : "Couldn't create main category. Try again."
            )
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
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <form.AppField name='title'>
                {(field) => (
                  <field.TextField label='Title' required placeholder='Enter main category title' />
                )}
              </form.AppField>
              <form.AppField name='slug'>
                {(field) => <field.TextField label='Slug' required placeholder='audio-stories' />}
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
                  <field.SwitchField label='Active' description='Show this category to users.' />
                )}
              </form.AppField>
              <form.AppField name='isFeatured'>
                {(field) => (
                  <field.SwitchField label='Featured' description='Highlight this category.' />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <LoadingButton loading={isPending} type='submit'>
              {isEdit ? 'Update Main Category' : 'Create Main Category'}
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
