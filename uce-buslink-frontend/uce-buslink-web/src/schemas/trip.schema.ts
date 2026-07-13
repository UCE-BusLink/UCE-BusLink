import { z } from 'zod';

export const tripEntitiesFormSchema = z.object({
  routeId: z.string().min(1, 'Selecciona una ruta.'),
  busId: z.string().min(1, 'Selecciona un bus.'),
  driverId: z.string().min(1, 'Selecciona un conductor.'),
});

export type TripEntitiesFormValues = z.output<typeof tripEntitiesFormSchema>;

const DEPARTURE_REGEX = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const createTripFormSchema = tripEntitiesFormSchema.extend({
  departures: z
    .array(z.string().regex(DEPARTURE_REGEX, 'Horario de salida inválido.'))
    .min(1, 'Debes seleccionar al menos un horario de salida en alguno de los días.'),
});

export type CreateTripFormValues = z.output<typeof createTripFormSchema>;
