import { z } from 'zod';

export const OPERATIONAL_STATUSES = ['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'] as const;

export const busFormSchema = z.object({
  plateNumber: z
    .string()
    .trim()
    .min(1, 'La placa es obligatoria.')
    .max(15, 'La placa no puede superar los 15 caracteres.'),
  internalCode: z
    .string()
    .trim()
    .min(1, 'El código interno es obligatorio.')
    .max(20, 'El código interno no puede superar los 20 caracteres.'),
  manufacturer: z
    .string()
    .trim()
    .min(1, 'El fabricante es obligatorio.')
    .max(50, 'El fabricante no puede superar los 50 caracteres.'),
  model: z
    .string()
    .trim()
    .min(1, 'El modelo es obligatorio.')
    .max(50, 'El modelo no puede superar los 50 caracteres.'),
  seatCapacity: z
    .string()
    .trim()
    .min(1, 'La capacidad es obligatoria.')
    .refine((v) => !Number.isNaN(Number(v)), 'La capacidad debe ser un número válido.')
    .transform(Number)
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 100, 'La capacidad debe estar entre 1 y 100 asientos.'),
  operationalStatus: z.enum(OPERATIONAL_STATUSES, 'Selecciona un estado operativo válido.'),
});

export type BusFormInput = z.input<typeof busFormSchema>;
export type BusFormValues = z.output<typeof busFormSchema>;
