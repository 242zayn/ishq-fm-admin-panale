import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BackendUser,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UsersResponse,
} from "./types";

function toDashboardUser(user: BackendUser): User {
  return {
    id: user._id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    profileBanner: user.profileBanner ?? "",
    referralCode: user.referralCode ?? "",
    status: user.isActive ? "Active" : "Inactive",
    avatar: user.avatar ?? null,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
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
      ? (response?.meta?.pagination?.total ?? response?.paginationData?.total)
      : undefined) ?? mappedUsers.length;

  return {
    users: mappedUsers,
    total_users: total,
    pagination: !Array.isArray(response)
      ? (response?.meta?.pagination ?? response?.paginationData)
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
