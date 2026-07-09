import { z } from 'zod';
import { coordinateNumberSchema } from './common';

export const DAY_IDS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const routeInfoFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(150, 'El nombre no puede superar los 150 caracteres.'),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
  estimatedDurationMinutes: z
    .string()
    .trim()
    .min(1, 'La duración estimada es obligatoria.')
    .refine((v) => !Number.isNaN(Number(v)), 'La duración debe ser un número válido.')
    .transform(Number)
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 600, 'La duración debe estar entre 1 y 600 minutos.'),
});

export type RouteInfoFormValues = z.output<typeof routeInfoFormSchema>;

export const routeStopSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'El nombre de la parada es obligatorio.'),
  latitude: coordinateNumberSchema('latitude'),
  longitude: coordinateNumberSchema('longitude'),
});

export const routeStopsListSchema = z
  .array(routeStopSchema)
  .min(2, 'Añade al menos 2 paradas para trazar una ruta.');

export const scheduleGroupSchema = z.object({
  daysOfWeek: z.array(z.enum(DAY_IDS)).min(1, 'Selecciona al menos un día para este bloque.'),
  fixedDepartureTimes: z
    .array(z.string().regex(TIME_REGEX, 'Hora de salida inválida.'))
    .min(1, 'Agrega al menos un horario de salida.'),
});

export const scheduleGroupsListSchema = z
  .array(scheduleGroupSchema)
  .min(1, 'Debes estructurar al menos un bloque de horarios antes de finalizar.');
