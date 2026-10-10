'use client';

import { useAppForm } from '@/lib/form';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAdminLogin } from '../api/hooks';
import { loginSchema, type LoginValues } from '../schemas/login';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useAdminLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    } as LoginValues,
    validators: {
      onSubmit: loginSchema
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await loginMutation.mutateAsync(value);
        toast.success('Welcome back');
        router.replace('/dashboard/overview');
        router.refresh();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to sign in.');
      }
    }
  });

  return (
    <main className='bg-muted/30 flex min-h-svh items-center justify-center px-4 py-10'>
      <div className='grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl lg:grid-cols-[1fr_1fr]'>
        <section className='bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex'>
          <div className='absolute inset-0 opacity-15 [background-image:radial-gradient(var(--primary-foreground)_1px,transparent_1px)] [background-size:22px_22px]' />
          <div className='relative flex items-center gap-3'>
            <span className='bg-primary-foreground/15 flex size-11 items-center justify-center rounded-xl'>
              <Icons.music aria-hidden />
            </span>
            <span className='text-lg font-semibold tracking-tight'>Story Admin</span>
          </div>
          <div className='relative max-w-md'>
            <p className='text-primary-foreground/70 text-sm font-medium tracking-[0.2em] uppercase'>
              Ishq FM · Administration
            </p>
            <h1 className='mt-5 text-4xl leading-tight font-semibold tracking-tight'>
              Your stories, managed in one place.
            </h1>
            <p className='text-primary-foreground/75 mt-4 leading-7'>
              Sign in with an administrator account to manage the story catalogue and content.
            </p>
          </div>
          <p className='relative text-primary-foreground/60 text-xs'>
            Secure access for authorized administrators only.
          </p>
        </section>

        <section className='flex items-center justify-center p-6 sm:p-10'>
          <Card className='w-full max-w-md border-0 bg-transparent shadow-none'>
            <CardHeader className='gap-3 px-0'>
              <div className='text-primary flex items-center gap-2 lg:hidden'>
                <Icons.music aria-hidden />
                <span className='font-semibold'>Story Admin</span>
              </div>
              <div>
                <CardTitle className='text-2xl tracking-tight'>Admin sign in</CardTitle>
                <CardDescription className='mt-2'>
                  Enter your administrator credentials to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className='px-0'>
              <form
                className='flex flex-col gap-5'
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <form.AppField
                    name='email'
                    children={(field) => (
                      <field.TextField
                        label='Email address'
                        type='email'
                        placeholder='admin@example.com'
                        autoComplete='username'
                        required
                      />
                    )}
                  />
                  <form.AppField
                    name='password'
                    children={(field) => (
                      <field.TextField
                        label='Password'
                        type='password'
                        placeholder='Enter your password'
                        autoComplete='current-password'
                        required
                      />
                    )}
                  />
                </FieldGroup>

                {formError && (
                  <p role='alert' className='text-destructive text-sm'>
                    {formError}
                  </p>
                )}

                <LoadingButton className='w-full' type='submit' loading={loginMutation.isPending}>
                  Sign in
                </LoadingButton>
                <p className='text-muted-foreground text-center text-xs'>
                  Access is restricted to active admin accounts.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
