'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { guestUsersQueryOptions } from '@/features/guest-users/api/queries';
import type { GuestUser } from '@/features/guest-users/api/types';
import { formatDateTime } from '@/lib/format';

interface GuestPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGuestId?: string;
  onSelect: (guest: GuestUser) => void;
}

export function GuestPickerDialog({
  open,
  onOpenChange,
  selectedGuestId,
  onSelect
}: GuestPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce API search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
    }
  }, [open]);

  // Query Backend Guest User API with search parameter
  const { data, isLoading, isFetching, error } = useQuery({
    ...guestUsersQueryOptions({
      search: debouncedSearch || undefined,
      limit: 50
    }),
    enabled: open
  });

  const guests = Array.isArray(data) ? data : [];

  const handleSelect = (guest: GuestUser) => {
    onSelect(guest);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 z-[70] bg-popover'>
        <DialogHeader className='p-4 pb-3 border-b shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <Icons.teams className='text-primary h-4 w-4' />
            Select Target Guest User
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            Search guest users live from API by name or guest ID.
          </DialogDescription>
        </DialogHeader>

        {/* Search input bar with live API search */}
        <div className='p-3 border-b bg-muted/20 shrink-0'>
          <div className='relative flex items-center'>
            <Icons.search className='absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by guest name or guest ID (API Search)...'
              className='pl-9 pr-8 h-9 text-xs bg-background'
              autoFocus
            />
            {isFetching && (
              <Icons.spinner className='absolute right-8 h-3.5 w-3.5 text-primary animate-spin pointer-events-none' />
            )}
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer p-0.5'
              >
                <Icons.close className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Guest scrollable list */}
        <div className='overflow-y-auto min-h-0 max-h-[350px] p-2 space-y-1 overscroll-contain'>
          {isLoading ? (
            <div className='space-y-2 p-2'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='flex items-center gap-3 p-2 rounded-lg'>
                  <Skeleton className='h-9 w-9 rounded-full' />
                  <div className='space-y-1.5 flex-1'>
                    <Skeleton className='h-3.5 w-32' />
                    <Skeleton className='h-3 w-44' />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='p-8 text-center text-xs text-destructive'>
              Failed to load guest users from API. Please try again.
            </div>
          ) : guests.length === 0 ? (
            <div className='py-12 text-center text-xs text-muted-foreground space-y-1'>
              <Icons.teams className='h-8 w-8 mx-auto text-muted-foreground/40 mb-2' />
              <p className='font-medium text-foreground'>No guest users found</p>
              {debouncedSearch ? (
                <p>No results from API matching &ldquo;{debouncedSearch}&rdquo;</p>
              ) : (
                <p>No guest users registered yet.</p>
              )}
            </div>
          ) : (
            guests.map((guest) => {
              const isSelected = selectedGuestId === guest.guestId || selectedGuestId === guest.id;

              return (
                <button
                  key={guest.id || guest.guestId}
                  type='button'
                  onClick={() => handleSelect(guest)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-accent/60 border border-transparent'
                  }`}
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs'>
                      <Icons.teams className='h-4 w-4' />
                    </div>
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-xs text-foreground truncate'>
                          {guest.name || 'Anonymous Guest'}
                        </span>
                        <Badge
                          variant='outline'
                          className='text-[10px] py-0 px-1.5 h-4 text-muted-foreground'
                        >
                          Guest
                        </Badge>
                      </div>
                      <span className='text-[11px] font-mono text-muted-foreground truncate'>
                        {guest.guestId}
                      </span>
                      {guest.lastActiveAt && (
                        <span className='text-[10px] text-muted-foreground/70'>
                          Active: {formatDateTime(guest.lastActiveAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center shrink-0'>
                    {isSelected ? (
                      <div className='flex items-center gap-1 text-primary text-xs font-medium'>
                        <Icons.check className='h-4 w-4' />
                        <span>Selected</span>
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground group-hover:text-foreground font-medium'>
                        Select
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className='p-3 border-t bg-muted/20 shrink-0 flex items-center justify-between text-xs text-muted-foreground z-10'>
          <span>
            {guests.length} guest{guests.length === 1 ? '' : 's'} from API
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-7 text-xs cursor-pointer'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
