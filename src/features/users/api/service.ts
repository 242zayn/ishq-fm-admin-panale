import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BackendUser,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UsersResponse,
} from "./types";

function toDashboardUser(raw: BackendUser): User {
  return {
    id: raw._id,
    name: raw.name,
    email: raw.email,
    profileBanner: raw.profileBanner ?? "",
    role: raw.role,
    status: raw.isActive ? "Active" : "Inactive",
    avatar: raw.avatar ?? null,
    referralCode: raw.referralCode ?? "",
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
  };
}

export async function getUsers(): Promise<UsersResponse> {
  const response = await apiClient<ApiResponse<BackendUser[]> | BackendUser[]>(
    "/backend/user",
  );

  const backendUsers = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];
  const mappedUsers = backendUsers.map(toDashboardUser);

  const total =
    (!Array.isArray(response)
      ? response?.meta?.pagination?.total
      : undefined) ?? mappedUsers.length;

  return {
    users: mappedUsers,
    total_users: total,
    pagination: !Array.isArray(response)
      ? response?.meta?.pagination
      : undefined,
  };
}

export async function createUser(
  data: CreateUserPayload,
): Promise<BackendUser> {
  return apiClient<BackendUser>("/backend/user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: string,
  data: UpdateUserPayload,
): Promise<BackendUser> {
  return apiClient<BackendUser>(`/backend/user/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(
    `/backend/user/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
