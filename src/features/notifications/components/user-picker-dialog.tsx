'use client';

import { useMemo, useState } from 'react';
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
import { usersQueryOptions } from '@/features/users/api/queries';
import type { User } from '@/features/users/api/types';

interface UserPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserId?: string;
  onSelect: (user: User) => void;
}

export function UserPickerDialog({
  open,
  onOpenChange,
  selectedUserId,
  onSelect
}: UserPickerDialogProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    ...usersQueryOptions(),
    enabled: open
  });

  const users = data?.users ?? [];

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(query);
      const emailMatch = u.email?.toLowerCase().includes(query);
      const idMatch = u.id?.toLowerCase().includes(query);
      return nameMatch || emailMatch || idMatch;
    });
  }, [users, search]);

  const handleSelect = (user: User) => {
    onSelect(user);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 z-[70] bg-popover'>
        <DialogHeader className='p-4 pb-3 border-b shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <Icons.user className='text-primary h-4 w-4' />
            Select Target User
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            Search and select a registered user by name, email, or MongoDB ID.
          </DialogDescription>
        </DialogHeader>

        {/* Search input bar */}
        <div className='p-3 border-b bg-muted/20 shrink-0'>
          <div className='relative flex items-center'>
            <Icons.search className='absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name, email, or user ID...'
              className='pl-9 pr-8 h-9 text-xs bg-background'
              autoFocus
            />
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

        {/* User scrollable list */}
        <div className='overflow-y-auto min-h-0 max-h-[350px] p-2 space-y-1 overscroll-contain'>
          {isLoading ? (
            <div className='space-y-2 p-2'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='flex items-center gap-3 p-2 rounded-lg'>
                  <Skeleton className='h-9 w-9 rounded-full' />
                  <div className='space-y-1.5 flex-1'>
                    <Skeleton className='h-3.5 w-32' />
                    <Skeleton className='h-3 w-48' />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='p-8 text-center text-xs text-destructive'>
              Failed to load users from API. Please try again.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='py-12 text-center text-xs text-muted-foreground space-y-1'>
              <Icons.user className='h-8 w-8 mx-auto text-muted-foreground/40 mb-2' />
              <p className='font-medium text-foreground'>No users found</p>
              {search ? (
                <p>No results matching &ldquo;{search}&rdquo;</p>
              ) : (
                <p>No registered users available.</p>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUserId === user.id;

              return (
                <button
                  key={user.id}
                  type='button'
                  onClick={() => handleSelect(user)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-accent/60 border border-transparent'
                  }`}
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs'>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-xs text-foreground truncate'>
                          {user.name}
                        </span>
                        {user.role && (
                          <Badge
                            variant='outline'
                            className='text-[10px] py-0 px-1.5 h-4 capitalize'
                          >
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      <span className='text-[11px] text-muted-foreground truncate'>
                        {user.email}
                      </span>
                      <span className='text-[10px] font-mono text-muted-foreground/70 truncate'>
                        ID: {user.id}
                      </span>
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
            {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} available
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
