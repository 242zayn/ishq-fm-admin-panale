import { queryOptions } from '@tanstack/react-query';
import { getUsers, type UserQueryParams } from './service';

export type { User } from './types';
export type { UserQueryParams } from './service';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const
};

export const usersQueryOptions = (params?: UserQueryParams) =>
  queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params)
  });
