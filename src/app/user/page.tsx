import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import UserAuth from './user-auth';

export const metadata: Metadata = { title: 'Your account | Ishq FM', description: 'Sign in to your Ishq FM account with an email verification code.' };

type UserProfile = { _id?: string; name?: string; email?: string; avatar?: string; role?: string; isActive?: boolean; createdAt?: string };

export default async function UserPage() {
  const token = (await cookies()).get('user_access_token')?.value;
  let profile: UserProfile | null = null;
  if (token) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (response.ok) {
        const payload: unknown = await response.json();
        if (typeof payload === 'object' && payload !== null && 'user' in payload && typeof payload.user === 'object' && payload.user !== null) profile = payload.user as UserProfile;
      }
    } catch { /* Render the sign-in view if the profile service is temporarily unavailable. */ }
  }
  return <UserAuth initialProfile={profile} />;
}
