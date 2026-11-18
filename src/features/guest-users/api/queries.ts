import { queryOptions } from '@tanstack/react-query';
import { getGuestUserById, getGuestUsers, type GuestUserQueryParams } from './service';

export type { GuestUser } from './types';
export type { GuestUserQueryParams } from './service';

export const guestUserKeys = {
  all: ['guest-users'] as const,
  lists: () => [...guestUserKeys.all, 'list'] as const,
  list: (params?: GuestUserQueryParams) => [...guestUserKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...guestUserKeys.all, 'detail', id] as const
};

export const guestUsersQueryOptions = (params?: GuestUserQueryParams) =>
  queryOptions({
    queryKey: guestUserKeys.list(params),
    queryFn: () => getGuestUsers(params)
  });

export const guestUserDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: guestUserKeys.detail(id),
    queryFn: () => getGuestUserById(id),
    enabled: Boolean(id)
  });
