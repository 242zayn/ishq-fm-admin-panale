export type UserRole = "user" | "admin" | "guest";

export interface PaginationData {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
  meta?: {
    pagination?: PaginationData;
  };
  // paginationData?: PaginationData;
}

export type User = {
  id: string;
  name: string;
  email: string;
  profileBanner: string;
  role: UserRole;
  status: "Active" | "Inactive";
  avatar: string | null;
  referralCode: string;
  created_at: string;
  updated_at: string;
};

export type BackendUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  profileBanner?: string | null;
  role: UserRole;
  isActive: boolean;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type UsersResponse = {
  users: User[];
  total_users: number;
  pagination?: PaginationData;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string | null;
  profileBanner?: string | null;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
  password?: string;
  isActive?: boolean;
  referralCode?: string;
};

export type UserApiRes = ApiResponse<BackendUser>;
