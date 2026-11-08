'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Referral } from '../../api/types';
import { CellAction } from './cell-action';
import { REFERRAL_STATUS_OPTIONS } from './options';

export const columns: ColumnDef<Referral>[] = [
  {
    id: 'referralCode',
    accessorKey: 'referralCode',
    header: ({ column }: { column: Column<Referral, unknown> }) => (
      <DataTableColumnHeader column={column} title='Referral Code' />
    ),
    cell: ({ cell }) => {
      const code = cell.getValue<string>();
      if (!code) return <span className='text-muted-foreground text-xs'>—</span>;
      return <CopyToClipboard variant='badge' text={code} successMessage='Referral code copied' />;
    },
    meta: {
      label: 'Code',
      placeholder: 'Search referral code...',
      variant: 'text' as const,
      icon: Icons.share
    },
    enableColumnFilter: true
  },
  {
    id: 'referrerId',
    accessorKey: 'referrerId',
    header: 'Referrer ID',
    cell: ({ cell }) => {
      const id = cell.getValue<string>();
      if (!id) return <span className='text-muted-foreground text-xs'>—</span>;
      return (
        <CopyToClipboard
          variant='inline'
          text={id}
          successMessage='Referrer ID copied'
          className='text-xs text-muted-foreground hover:text-foreground'
        />
      );
    }
  },
  {
    id: 'referredUserId',
    accessorKey: 'referredUserId',
    header: 'Referred User ID',
    cell: ({ cell }) => {
      const id = cell.getValue<string>();
      if (!id) return <span className='text-muted-foreground text-xs'>—</span>;
      return (
        <CopyToClipboard
          variant='inline'
          text={id}
          successMessage='Referred User ID copied'
          className='text-xs text-muted-foreground hover:text-foreground'
        />
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue<Referral['status']>();
      switch (status) {
        case 'rewarded':
          return (
            <Badge
              variant='outline'
              className='border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize'
            >
              <Icons.check className='mr-1 h-3 w-3' />
              Rewarded
            </Badge>
          );
        case 'qualified':
          return (
            <Badge
              variant='outline'
              className='border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 capitalize'
            >
              Qualified
            </Badge>
          );
        case 'pending':
        default:
          return (
            <Badge
              variant='outline'
              className='border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 capitalize'
            >
              <Icons.spinner className='mr-1 h-3 w-3 animate-spin' />
              Pending
            </Badge>
          );
      }
    },
    meta: {
      label: 'Status',
      variant: 'multiSelect' as const,
      options: REFERRAL_STATUS_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'rewardDays',
    accessorKey: 'rewardDays',
    header: 'Reward',
    cell: ({ cell }) => {
      const days = cell.getValue<number>() ?? 0;
      return (
        <Badge variant='secondary' className='font-medium text-emerald-600 dark:text-emerald-400'>
          +{days} Days
        </Badge>
      );
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<Referral, unknown> }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ cell }) => {
      const rawDate = cell.getValue<string>();
      if (!rawDate) return <span className='text-muted-foreground'>—</span>;
      const date = new Date(rawDate);
      return Number.isNaN(date.getTime())
        ? '—'
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          }).format(date);
    }
  }
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => <CellAction data={row.original} />,
  // },
];
