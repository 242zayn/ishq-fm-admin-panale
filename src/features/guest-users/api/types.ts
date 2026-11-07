export type GuestUser = {
  id: string;
  guestId: string;
  name: string;
  isAdult: boolean;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BackendGuestUser = {
  _id: string;
  guestId: string;
  name: string;
  isAdult: boolean;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type GuestUsersResponse = {
  message: string;
  data: BackendGuestUser[];
};

export type SingleGuestUserResponse = {
  message: string;
  data: BackendGuestUser;
};

export type CreateGuestUserPayload = {
  guestId: string;
  name: string;
  isAdult: boolean;
};

export type UpdateGuestUserPayload = Partial<CreateGuestUserPayload>;
