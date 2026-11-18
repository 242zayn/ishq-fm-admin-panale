export type NotificationScreenTarget =
  | 'home'
  | 'story'
  | 'category'
  | 'profile'
  | 'subscription'
  | (string & {});

export type NotificationRecord = {
  id: string;
  _id: string;
  userId?: string | null;
  guestId?: string | null;
  title: string;
  body: string;
  data?: {
    screen?: NotificationScreenTarget;
    storyId?: string;
    categoryId?: string;
    url?: string;
    [key: string]: unknown;
  };
  imageUrl?: string | null;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NotificationListResponse = {
  data: NotificationRecord[];
  meta: NotificationPaginationMeta;
};

export type NotificationFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type SendNotificationPayload = {
  userId?: string;
  guestId?: string;
  pushToken?: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
};

export type BroadcastNotificationPayload = {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
};

export type NotificationDispatchTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: unknown;
};

export type NotificationDispatchResponse = {
  success: boolean;
  sentCount?: number;
  message?: string;
  tickets?: NotificationDispatchTicket[];
};

export type MarkNotificationReadResponse = {
  success: boolean;
  message: string;
  notificationId: string;
};

export type MarkAllNotificationsReadResponse = {
  success: boolean;
  message: string;
};
