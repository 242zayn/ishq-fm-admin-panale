'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import { userKeys } from '../api/queries';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { userSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS } from './users-table/options';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const isEdit = !!user;
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User created');
      onOpenChange(false);
      form.reset();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't create user.")
  });

  const updateMutation = useMutation({
    ...updateUserMutation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated');
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't update user.")
  });

  const form = useAppForm({
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'user',
      status: user?.status ?? 'Active'
    } as UserFormValues,
    validators: {
      onSubmit: userSchema
    },
    onSubmit: async ({ value }) => {
      const name = `${value.first_name} ${value.last_name}`.trim();

      if (isEdit) {
        await updateMutation.mutateAsync({
          id: user.id,
          values: {
            name,
            email: value.email,
            role: value.role,
            isActive: value.status === 'Active',
            ...(value.password ? { password: value.password } : {})
          }
        });
      } else {
        await createMutation.mutateAsync({
          name,
          email: value.email,
          password: value.password,
          role: value.role
        });
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit User' : 'New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user details below.'
              : 'Fill in the details to create a new user.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='user-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='first_name'
                  children={(field) => (
                    <field.TextField label='First Name' required placeholder='John' />
                  )}
                />
                <form.AppField
                  name='last_name'
                  children={(field) => <field.TextField label='Last Name' placeholder='Doe' />}
                />
              </div>

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField
                    label='Email'
                    required
                    type='email'
                    placeholder='john@example.com'
                  />
                )}
              />

              <form.AppField
                name='password'
                validators={{
                  onSubmit: ({ value }) =>
                    !value && isEdit
                      ? undefined
                      : value.length < 6
                        ? 'Password must be at least 6 characters'
                        : undefined
                }}
                children={(field) => (
                  <field.TextField
                    label={isEdit ? 'New password' : 'Password'}
                    required={!isEdit}
                    type='password'
                    placeholder={
                      isEdit ? 'Leave blank to keep current password' : 'At least 6 characters'
                    }
                    description={isEdit ? 'Leave blank to keep the current password.' : undefined}
                  />
                )}
              />

              <form.AppField
                name='role'
                children={(field) => (
                  <field.SelectField
                    label='Role'
                    required
                    options={ROLE_OPTIONS}
                    placeholder='Select role'
                  />
                )}
              />

              <form.AppField
                name='status'
                children={(field) => (
                  <field.SelectField
                    label='Status'
                    required
                    options={STATUS_OPTIONS}
                    placeholder='Select status'
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='user-form-sheet'>
            {isEdit ? 'Update User' : 'Create User'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' /> Add User
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
