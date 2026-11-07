import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { createGuestUser, deleteGuestUser, updateGuestUser } from "./service";
import { guestUserKeys } from "./queries";
import type { CreateGuestUserPayload, UpdateGuestUserPayload } from "./types";

export const createGuestUserMutation = mutationOptions({
  mutationFn: (data: CreateGuestUserPayload) => createGuestUser(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: guestUserKeys.all });
  },
});

export const updateGuestUserMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: UpdateGuestUserPayload;
  }) => updateGuestUser(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: guestUserKeys.all });
  },
});

export const deleteGuestUserMutation = mutationOptions({
  mutationFn: (id: string) => deleteGuestUser(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: guestUserKeys.all });
  },
});
