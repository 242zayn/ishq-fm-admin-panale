'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useNotifications } from '../../hooks/useNotifications';
import { columns } from './columns';

export function NotificationsTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    title: parseAsString
  });

  const { data, error, isLoading } = useNotifications({
    page: params.page,
    limit: params.perPage
  });

  if (error) {
    throw error;
  }

  const items = data?.data ?? [];
  const filteredData = params.title
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(params.title!.toLowerCase()) ||
          item.body.toLowerCase().includes(params.title!.toLowerCase())
      )
    : items;

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: data?.meta?.totalPages ?? 0,
    shallow: true,
    debounceMs: 500,
    initialState: {
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.perPage
      },
      columnPinning: { right: ['actions'] }
    }
  });

  if (isLoading || !data) {
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

export { columns } from './columns';
