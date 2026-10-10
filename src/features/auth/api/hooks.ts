'use client';

import { useMutation } from '@tanstack/react-query';
import { authResource } from './resource';

export function useAdminLogin() {
  return useMutation({
    mutationFn: authResource.login
  });
}
