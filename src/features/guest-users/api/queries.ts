import { queryOptions } from "@tanstack/react-query";
import { getGuestUserById, getGuestUsers } from "./service";

export type { GuestUser } from "./types";

export const guestUserKeys = {
  all: ["guest-users"] as const,
  list: () => [...guestUserKeys.all, "list"] as const,
  detail: (id: string) => [...guestUserKeys.all, "detail", id] as const,
};

export const guestUsersQueryOptions = () =>
  queryOptions({
    queryKey: guestUserKeys.list(),
    queryFn: getGuestUsers,
  });

export const guestUserDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: guestUserKeys.detail(id),
    queryFn: () => getGuestUserById(id),
    enabled: Boolean(id),
  });
