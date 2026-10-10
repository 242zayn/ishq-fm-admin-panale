import * as z from 'zod';

export const categorySchema = z.object({
  mainCategory: z.string(),
  title: z.string().trim().min(1, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
  description: z.string(),
  bannerImage: z.string(),
  iconImage: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().min(0, 'Sort order cannot be negative'),
  tags: z.string()
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
