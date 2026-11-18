'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatDateTime } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { NotificationRecord } from '../../api/types';
import { NotificationCellAction } from './cell-action';

export const columns: ColumnDef<NotificationRecord>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<NotificationRecord, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col gap-0.5 max-w-sm'>
        <span className='font-semibold text-foreground line-clamp-1'>{row.original.title}</span>
        <span className='text-xs text-muted-foreground line-clamp-2'>{row.original.body}</span>
      </div>
    ),
    meta: {
      label: 'Title',
      placeholder: 'Search notifications...',
      variant: 'text' as const,
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const isBroadcast = row.original.isBroadcast;
      return isBroadcast ? (
        <Badge
          variant='outline'
          className='border-primary/20 bg-primary/10 text-primary capitalize font-medium text-xs'
        >
          <Icons.share className='mr-1 h-3 w-3' />
          Broadcast
        </Badge>
      ) : (
        <Badge variant='secondary' className='text-xs'>
          Targeted
        </Badge>
      );
    }
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { isBroadcast, isRead } = row.original;
      if (isBroadcast) {
        return (
          <Badge
            variant='outline'
            className='border-border/60 bg-muted/40 text-muted-foreground text-xs font-normal'
            title='Broadcast notifications are delivered as global announcements'
          >
            Universal
          </Badge>
        );
      }
      return isRead ? (
        <Badge
          variant='outline'
          className='border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium'
        >
          <Icons.check className='mr-1 h-3 w-3' />
          Read
        </Badge>
      ) : (
        <Badge
          variant='outline'
          className='border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium'
        >
          <span className='mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500' />
          Unread
        </Badge>
      );
    }
  },
  {
    id: 'target',
    header: 'Target / User',
    cell: ({ row }) => {
      const { isBroadcast, userId, guestId } = row.original;
      if (isBroadcast) {
        return <span className='text-xs text-muted-foreground font-medium'>All Active Users</span>;
      }
      if (userId) {
        return (
          <div className='flex items-center gap-1.5'>
            <span className='text-[10px] font-semibold text-muted-foreground uppercase'>User:</span>
            <CopyToClipboard
              text={userId}
              variant='inline'
              successMessage='User ID copied'
              className='text-xs text-muted-foreground hover:text-foreground font-mono'
            />
          </div>
        );
      }
      if (guestId) {
        return (
          <div className='flex items-center gap-1.5'>
            <span className='text-[10px] font-semibold text-muted-foreground uppercase'>
              Guest:
            </span>
            <CopyToClipboard
              text={guestId}
              variant='inline'
              successMessage='Guest ID copied'
              className='text-xs text-muted-foreground hover:text-foreground font-mono'
            />
          </div>
        );
      }
      return <span className='text-xs text-muted-foreground'>—</span>;
    }
  },
  {
    id: 'screen',
    header: 'Target Screen',
    cell: ({ row }) => {
      const screen = row.original.data?.screen;
      if (!screen) {
        return <span className='text-xs text-muted-foreground'>—</span>;
      }
      return (
        <Badge variant='outline' className='capitalize font-mono text-[11px]'>
          {screen}
        </Badge>
      );
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<NotificationRecord, unknown> }) => (
      <DataTableColumnHeader column={column} title='Sent At' />
    ),
    cell: ({ cell }) => {
      const rawDate = cell.getValue<string>();
      return (
        <span className='text-xs text-muted-foreground whitespace-nowrap'>
          {formatDateTime(rawDate)}
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <NotificationCellAction data={row.original} />
  }
];
