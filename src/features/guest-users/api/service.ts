import { apiClient } from "@/lib/api-client";
import type {
  BackendGuestUser,
  CreateGuestUserPayload,
  GuestUser,
  GuestUsersResponse,
  SingleGuestUserResponse,
  UpdateGuestUserPayload,
} from "./types";

function toGuestUser(raw: BackendGuestUser): GuestUser {
  return {
    id: raw._id,
    guestId: raw.guestId,
    name: raw.name,
    isAdult: Boolean(raw.isAdult),
    lastActiveAt: raw.lastActiveAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getGuestUsers(): Promise<GuestUser[]> {
  const response = await apiClient<GuestUsersResponse>("/backend/guest-user");
  const items = Array.isArray(response) ? response : (response?.data ?? []);
  return items.map(toGuestUser);
}

export async function getGuestUserById(id: string): Promise<GuestUser> {
  const response = await apiClient<SingleGuestUserResponse>(
    `/backend/guest-user/${encodeURIComponent(id)}`,
  );
  const data = response?.data ?? (response as unknown as BackendGuestUser);
  return toGuestUser(data);
}

export async function createGuestUser(
  data: CreateGuestUserPayload,
): Promise<GuestUser> {
  const response = await apiClient<SingleGuestUserResponse>(
    "/backend/guest-user",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  const result = response?.data ?? (response as unknown as BackendGuestUser);
  return toGuestUser(result);
}

export async function updateGuestUser(
  id: string,
  data: UpdateGuestUserPayload,
): Promise<GuestUser> {
  const response = await apiClient<SingleGuestUserResponse>(
    `/backend/guest-user/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
  const result = response?.data ?? (response as unknown as BackendGuestUser);
  return toGuestUser(result);
}

export async function deleteGuestUser(
  id: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(
    `/backend/guest-user/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
