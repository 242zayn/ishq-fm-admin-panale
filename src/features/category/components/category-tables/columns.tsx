'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Category } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Category>[] = [
    {
    accessorKey: 'banner',
    header: 'Banner',
    cell:({row}) =>{
     const bannerImage = row.original.bannerImage;
      return (
        <div className='w-10 h-14 overflow-hidden bg-red-500 border-2  rounded-md '>

          <img src={bannerImage} alt='df' className=' size-full '  />
        </div>
      )
    }
  },
  {
    id: 'name',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>
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
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
