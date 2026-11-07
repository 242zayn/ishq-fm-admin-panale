export type UserRole = "user" | "admin" | "guest";

// export type ApiResponce

export interface ApiResponse<T> {
  message?: string;
  data: T;
  paginationData?: PaginationData;
}
export interface PaginationData {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
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
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UsersResponse = {
  users: User[];
  total_users: number;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
  password?: string;
  isActive?: boolean;
};

export type UserApiRes = ApiResponse<User>;
