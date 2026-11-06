import * as z from "zod";

export const guestUserSchema = z.object({
  guestId: z
    .string()
    .trim()
    .min(1, "Device/Guest ID is required")
    .max(100, "Guest ID must be less than 100 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be less than 80 characters"),
  isAdult: z.boolean(),
});

export type GuestUserFormValues = z.infer<typeof guestUserSchema>;
