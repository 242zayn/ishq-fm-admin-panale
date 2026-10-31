'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { columns } from './columns';
import { useMainCategories } from '../../hooks/useMainCategory';
import { Skeleton } from '@/components/ui/skeleton';

export function MainCategoryTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name })
  };

  const { data, error } = useMainCategories(filters);

  if (error) {
    throw error;
  }

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta.pagination.totalPages ?? 0,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (!data) {
    return (
      <div className='space-y-4 p-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
