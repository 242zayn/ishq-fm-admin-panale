import { apiClient } from '@/lib/api-client';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type {
  BroadcastNotificationPayload,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationDispatchResponse,
  NotificationFilters,
  NotificationListResponse,
  NotificationRecord,
  SendNotificationPayload
} from './types';

function normalizeNotification(raw: unknown): NotificationRecord {
  if (!raw || typeof raw !== 'object') {
    return {} as NotificationRecord;
  }
  const item = raw as Record<string, unknown>;
  const id = String(item._id ?? item.id ?? '');

  return {
    id,
    _id: id,
    userId: item.userId ? String(item.userId) : null,
    guestId: item.guestId ? String(item.guestId) : null,
    title: String(item.title ?? ''),
    body: String(item.body ?? ''),
    data:
      item.data && typeof item.data === 'object' ? (item.data as NotificationRecord['data']) : {},
    imageUrl: item.imageUrl ? String(item.imageUrl) : null,
    isRead: Boolean(item.isRead),
    isBroadcast: item.isBroadcast !== false,
    createdAt: String(item.createdAt ?? ''),
    updatedAt: String(item.updatedAt ?? '')
  };
}

export const notificationResource = {
  /**
   * Get paginated in-app notification history
   * GET /backend/notifications/my?page=1&limit=20
   */
  getNotifications: async (params: NotificationFilters = {}): Promise<NotificationListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const response = await apiClient<NotificationListResponse>(
      `/backend/notifications${query ? `?${query}` : ''}`
    );

    const items = Array.isArray(response?.data) ? response.data : [];

    return {
      data: items.map(normalizeNotification),
      meta: response?.meta ?? {
        total: items.length,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        totalPages: 1
      }
    };
  },

  /**
   * Send notification to specific user, guest, or single pushToken
   * POST /backend/notifications/send
   */
  sendNotification: async (
    payload: SendNotificationPayload
  ): Promise<NotificationDispatchResponse> => {
    return apiClient<NotificationDispatchResponse>('/backend/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Broadcast notification to all registered users
   * POST /backend/notifications/broadcast
   */
  broadcastNotification: async (
    payload: BroadcastNotificationPayload
  ): Promise<NotificationDispatchResponse> => {
    return apiClient<NotificationDispatchResponse>('/backend/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Mark single personal notification as read
   * PATCH /backend/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<MarkNotificationReadResponse> => {
    return apiClient<MarkNotificationReadResponse>(
      `/backend/notifications/${encodeURIComponent(id)}/read`,
      {
        method: 'PATCH'
      }
    );
  },

  /**
   * Mark all personal notifications as read
   * PATCH /backend/notifications/read-all
   */
  markAllAsRead: async (): Promise<MarkAllNotificationsReadResponse> => {
    return apiClient<MarkAllNotificationsReadResponse>('/backend/notifications/read-all', {
      method: 'PATCH'
    });
  }
};

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters ?? {}] as const
};

export const notificationsQueryOptions = (filters?: NotificationFilters) =>
  queryOptions({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationResource.getNotifications(filters)
  });

export const sendNotificationMutation = mutationOptions({
  mutationFn: (payload: SendNotificationPayload) => notificationResource.sendNotification(payload)
});

export const broadcastNotificationMutation = mutationOptions({
  mutationFn: (payload: BroadcastNotificationPayload) =>
    notificationResource.broadcastNotification(payload)
});

export const markAllNotificationsReadMutation = mutationOptions({
  mutationFn: () => notificationResource.markAllAsRead()
});
