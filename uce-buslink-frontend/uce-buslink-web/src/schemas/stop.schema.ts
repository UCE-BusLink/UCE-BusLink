import { z } from 'zod';
import { coordinateStringSchema } from './common';

export const stopFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  latitude: coordinateStringSchema('latitude'),
  longitude: coordinateStringSchema('longitude'),
});

export type StopFormInput = z.input<typeof stopFormSchema>;
export type StopFormValues = z.output<typeof stopFormSchema>;
