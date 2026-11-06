import { apiClient } from '@/lib/api-client';
import type {
  BackendUser,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UsersResponse
} from './types';

function toDashboardUser(user: BackendUser): User {
  const [firstName = '', ...lastName] = user.name.trim().split(/\s+/);

  return {
    id: user['_id'],
    first_name: firstName,
    last_name: lastName.join(' '),
    email: user.email,
    role: user.role,
    status: user.isActive ? 'Active' : 'Inactive',
    avatar: user.avatar ?? null,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
}

export async function getUsers(): Promise<UsersResponse> {
  const users = await apiClient<BackendUser[]>('/backend/user');
  const mappedUsers = users.map(toDashboardUser);

  return {
    users: mappedUsers,
    total_users: mappedUsers.length
  };
}

export async function createUser(data: CreateUserPayload): Promise<BackendUser> {
  return apiClient<BackendUser>('/backend/user', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateUser(id: string, data: UpdateUserPayload): Promise<BackendUser> {
  return apiClient<BackendUser>(`/backend/user/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/backend/user/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
