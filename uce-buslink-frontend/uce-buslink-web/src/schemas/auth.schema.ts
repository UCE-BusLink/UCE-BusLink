import { z } from 'zod';

export const syncResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['STUDENT', 'DRIVER', 'ADMIN', 'SUPERVISOR']),
  needsOnboarding: z.boolean(),
});

export type SyncResponse = z.output<typeof syncResponseSchema>;

export const syncErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type SyncError = z.output<typeof syncErrorSchema>;
