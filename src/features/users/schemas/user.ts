import * as z from 'zod';

const userFormFields = {
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim(),
  email: z.string().trim().email('Please enter a valid email'),
  role: z.enum(['user', 'admin', 'guest']),
  status: z.enum(['Active', 'Inactive'])
};

export const userSchema = z.object({
  ...userFormFields,
  password: z.union([z.literal(''), z.string().min(6, 'Password must be at least 6 characters')])
});

export type UserFormValues = z.infer<typeof userSchema>;
