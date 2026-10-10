import { apiClient } from '@/lib/api-client';
import type { LoginValues } from '../schemas/login';
import type { LoginResponse } from './types';

export const authResource = {
  login(values: LoginValues): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/backend/auth/login', {
      method: 'POST',
      body: JSON.stringify(values)
    });
  }
};
