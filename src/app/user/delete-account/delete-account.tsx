'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export default function DeleteAccount() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await apiClient<{ message: string }>('/backend/user-auth/delete-account', { method: 'DELETE', body: JSON.stringify({ confirmation }) });
      router.replace('/user'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete your account.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={handleDelete} className='mt-7 space-y-4'><div className='space-y-2'><Label htmlFor='delete-confirmation'>Type <span className='font-mono font-semibold'>DELETE-MY-ACCOUNT</span> to confirm</Label><Input id='delete-confirmation' value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete='off' required /></div>{error && <p role='alert' className='break-words text-sm text-destructive'>{error}</p>}<Button type='submit' variant='destructive' className='w-full' disabled={busy || confirmation !== 'DELETE-MY-ACCOUNT'}>{busy ? 'Deleting account…' : 'Permanently delete my account'}</Button></form>;
}
