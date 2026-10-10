export type UserRole = 'user' | 'admin' | 'guest';

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  avatar: string | null;
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

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & {
  password?: string;
  isActive?: boolean;
};
