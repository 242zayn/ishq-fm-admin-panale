'use client';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { MainCategory } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<MainCategory>[] = [
  {
    id: 'name',
    accessorKey: 'title',
    header: ({ column }: { column: Column<MainCategory, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>,

  },
  {
    accessorKey: 'slug',
    header: 'SLUG',
    enableSorting: false
  },
  {
    accessorKey: 'isActive',
    header: 'STATUS',
    cell: ({ row }) => {
      const active = row.original.isActive;
      const Icon = active ? Icons.circleCheck : Icons.xCircle;
      return (
        <Badge variant='outline' className='capitalize'>
          <Icon />
          {active ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'isFeatured',
    header: 'FEATURED',
    cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
    enableSorting: false
  },
  {
    accessorKey: 'sortOrder',
    header: 'ORDER',
    enableSorting: false
  },
  {
    accessorKey: 'tags',
    header: 'TAGS',
    cell: ({ cell }) => (cell.getValue<string[]>() ?? []).join(', '),
    enableSorting: false
  },
  {
    accessorKey:"actions",
    header:"Actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
