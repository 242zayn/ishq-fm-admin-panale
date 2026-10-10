export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  isActive: boolean;
};

export type LoginResponse = {
  message: string;
  user: AdminUser;
};
