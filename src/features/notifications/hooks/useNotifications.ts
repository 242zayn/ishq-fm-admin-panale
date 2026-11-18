'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  broadcastNotificationMutation,
  markAllNotificationsReadMutation,
  notificationKeys,
  notificationResource,
  notificationsQueryOptions,
  sendNotificationMutation
} from '../api/service';
import type { NotificationFilters } from '../api/types';

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    ...notificationsQueryOptions(filters),
    enabled: typeof window !== 'undefined'
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    ...sendNotificationMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    ...broadcastNotificationMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationResource.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    ...markAllNotificationsReadMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}
