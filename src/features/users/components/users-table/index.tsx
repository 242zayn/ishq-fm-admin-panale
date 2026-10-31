'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { usersQueryOptions } from '../../api/queries';
import type { User } from '../../api/types';
import { columns } from './columns';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

function getSortValue(user: User, columnId: string): string {
  switch (columnId) {
    case 'name':
      return `${user.first_name} ${user.last_name}`;
    case 'role':
      return user.role;
    case 'status':
      return user.status;
    case 'created_at':
      return user.created_at;
    default:
      return '';
  }
}

export function UsersTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    role: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const { data, error, isPending, refetch } = useQuery(usersQueryOptions());
  const userRecords = data?.users;
  const filteredUsers = useMemo(() => {
    const search = params.name?.trim().toLocaleLowerCase();
    const selectedRoles = new Set(params.role?.split(/[,.]/).filter(Boolean) ?? []);
    const users = (userRecords ?? []).filter((user) => {
      const matchesSearch =
        !search ||
        `${user.first_name} ${user.last_name} ${user.email}`.toLocaleLowerCase().includes(search);
      return matchesSearch && (!selectedRoles.size || selectedRoles.has(user.role));
    });

    const [sort] = params.sort;
    if (sort) {
      users.sort((left, right) => {
        const comparison = getSortValue(left, sort.id).localeCompare(
          getSortValue(right, sort.id),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
        return sort.desc ? -comparison : comparison;
      });
    }
    return users;
  }, [userRecords, params.name, params.role, params.sort]);

  const pageCount = Math.ceil(filteredUsers.length / params.perPage);
  const pageStart = (params.page - 1) * params.perPage;
  const pageUsers = filteredUsers.slice(pageStart, pageStart + params.perPage);

  const { table } = useDataTable({
    data: pageUsers,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (isPending) return <UsersTableSkeleton />;
  if (error) {
    return (
      <div role='alert' className='text-destructive flex flex-col items-start gap-3'>
        <p>Could not load users: {error.message}</p>
        <Button variant='outline' onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
