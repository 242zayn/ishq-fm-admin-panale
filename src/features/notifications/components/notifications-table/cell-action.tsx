'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import type { NotificationRecord } from '../../api/types';
import { useMarkNotificationAsRead } from '../../hooks/useNotifications';

type CellActionProps = {
  data: NotificationRecord;
};

export function NotificationCellAction({ data }: CellActionProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = async () => {
    try {
      const res = await markAsReadMutation.mutateAsync(data.id || data._id);
      if (res.success) {
        toast.success(res.message || 'Notification marked as read');
      } else {
        toast.error('Failed to mark notification as read');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as read');
    }
  };

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Icons.notification className='text-primary h-5 w-5' />
              Notification Details
            </DialogTitle>
            <DialogDescription>
              Detailed payload and target for this notification record.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-sm'>
            <div className='flex items-center justify-between border-b pb-2'>
              <span className='text-muted-foreground'>Title</span>
              <span className='font-medium text-foreground max-w-[220px] truncate text-right'>
                {data.title}
              </span>
            </div>

            <div className='flex flex-col gap-1 border-b pb-2'>
              <span className='text-muted-foreground'>Message</span>
              <p className='text-xs text-foreground bg-muted/40 rounded-md p-2.5 whitespace-pre-wrap leading-relaxed'>
                {data.body}
              </p>
            </div>

            <div className='flex items-center justify-between border-b pb-2'>
              <span className='text-muted-foreground'>Type</span>
              {data.isBroadcast ? (
                <Badge variant='outline' className='border-primary/20 bg-primary/10 text-primary'>
                  Broadcast (All Users)
                </Badge>
              ) : (
                <Badge variant='secondary'>Targeted (Personal)</Badge>
              )}
            </div>

            <div className='flex items-center justify-between border-b pb-2'>
              <span className='text-muted-foreground'>Status</span>
              {data.isBroadcast ? (
                <Badge variant='outline' className='text-xs text-muted-foreground'>
                  Broadcast Announcement
                </Badge>
              ) : data.isRead ? (
                <Badge
                  variant='outline'
                  className='border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs'
                >
                  <Icons.check className='mr-1 h-3 w-3' />
                  Read
                </Badge>
              ) : (
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs'
                  >
                    Unread
                  </Badge>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 text-xs text-primary'
                    disabled={markAsReadMutation.isPending}
                    onClick={handleMarkAsRead}
                  >
                    Mark as Read
                  </Button>
                </div>
              )}
            </div>

            {data.userId && (
              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>Target User ID</span>
                <CopyToClipboard
                  text={data.userId}
                  variant='inline'
                  successMessage='User ID copied'
                />
              </div>
            )}

            {data.guestId && (
              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>Target Guest ID</span>
                <CopyToClipboard
                  text={data.guestId}
                  variant='inline'
                  successMessage='Guest ID copied'
                />
              </div>
            )}

            {data.data?.screen && (
              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>Target Screen</span>
                <Badge variant='outline' className='capitalize font-mono text-xs'>
                  {data.data.screen}
                </Badge>
              </div>
            )}

            {data.data?.storyId && (
              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>Story ID</span>
                <CopyToClipboard
                  text={String(data.data.storyId)}
                  variant='inline'
                  successMessage='Story ID copied'
                />
              </div>
            )}

            {data.imageUrl && (
              <div className='flex flex-col gap-1 border-b pb-2'>
                <span className='text-muted-foreground'>Attached Image</span>
                <a
                  href={data.imageUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-xs text-primary hover:underline truncate'
                >
                  {data.imageUrl}
                </a>
              </div>
            )}

            <div className='flex items-center justify-between border-b pb-2'>
              <span className='text-muted-foreground'>Record ID</span>
              <CopyToClipboard
                text={data.id || data._id}
                variant='inline'
                successMessage='Notification ID copied'
              />
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Sent At</span>
              <span className='text-xs'>{formatDateTime(data.createdAt)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground hover:bg-accent hover:text-foreground h-8 w-8 cursor-pointer rounded-lg border border-border/40'
          onClick={() => setDetailsOpen(true)}
          title='View Details'
        >
          <Icons.info className='h-4 w-4' />
          <span className='sr-only'>View Details</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:bg-accent hover:text-foreground h-8 w-8 cursor-pointer rounded-lg border border-border/40'
              >
                <Icons.ellipsis className='h-4 w-4' />
              </Button>
            }
          />
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setDetailsOpen(true)} className='cursor-pointer'>
              <Icons.info className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>

            {!data.isBroadcast && !data.isRead && (
              <DropdownMenuItem
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
                className='cursor-pointer text-emerald-600 focus:text-emerald-600'
              >
                <Icons.check className='mr-2 h-4 w-4' />
                Mark as Read
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(data.title);
              }}
              className='cursor-pointer'
            >
              <Icons.copy className='mr-2 h-4 w-4' />
              Copy Title
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(data.body);
              }}
              className='cursor-pointer'
            >
              <Icons.copy className='mr-2 h-4 w-4' />
              Copy Body
            </DropdownMenuItem>
            {data.userId && (
              <DropdownMenuItem
                onClick={() => {
                  void navigator.clipboard.writeText(data.userId!);
                }}
                className='cursor-pointer'
              >
                <Icons.copy className='mr-2 h-4 w-4' />
                Copy User ID
              </DropdownMenuItem>
            )}
            {data.guestId && (
              <DropdownMenuItem
                onClick={() => {
                  void navigator.clipboard.writeText(data.guestId!);
                }}
                className='cursor-pointer'
              >
                <Icons.copy className='mr-2 h-4 w-4' />
                Copy Guest ID
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
