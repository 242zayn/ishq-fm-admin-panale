import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  redirect(cookieStore.has('admin_access_token') ? '/dashboard/overview' : '/login');
}
