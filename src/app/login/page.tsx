import LoginForm from '@/features/auth/components/login-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Sign In',
  description: 'Sign in to the Ishq FM story administration dashboard.'
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has('admin_access_token')) {
    redirect('/dashboard/overview');
  }

  return <LoginForm />;
}
