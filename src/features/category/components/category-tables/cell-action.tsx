'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Category } from '../../api/types';
import { useDeleteCategory } from '../../hooks/useCategory';
import { mainCategoryKeys } from '@/features/main-category/api/queries';
import { categoryKeys } from '../../api/queries';

type CellActionProps = {
  data: Category;
};

export function CellAction({ data }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteCategory();

  console.log('category data is that', data);

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(data._id, {
            onSuccess: () => {
              toast.success('Category deleted successfully');
              setOpen(false);
              queryClient.invalidateQueries({ queryKey: categoryKeys.all });
              queryClient.invalidateQueries({
                queryKey: mainCategoryKeys.all,
                refetchType: 'all'
              });
            },
            onError: (error) =>
              toast.error(error instanceof Error ? error.message : 'Failed to delete category')
          })
        }
        loading={deleteMutation.isPending}
      />
      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 cursor-pointer rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground'
          onClick={() => router.push(`/dashboard/category/${data._id}`)}
          title='Edit Category'
        >
          <Icons.edit className='h-4 w-4' />
          <span className='sr-only'>Edit</span>
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 cursor-pointer rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300'
          onClick={() => setOpen(true)}
          title='Delete Category'
        >
          <Icons.trash className='h-4 w-4' />
          <span className='sr-only'>Delete</span>
        </Button>
      </div>
    </>
  );
}
