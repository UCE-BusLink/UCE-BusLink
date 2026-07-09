import { z } from 'zod';

const COORD_RANGES = {
  latitude: { min: -90, max: 90, label: 'La latitud' },
  longitude: { min: -180, max: 180, label: 'La longitud' },
} as const;

export function coordinateStringSchema(kind: keyof typeof COORD_RANGES) {
  const { min, max, label } = COORD_RANGES[kind];
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatoria.`)
    .refine((v) => !Number.isNaN(Number(v)), `${label} debe ser un número válido.`)
    .transform(Number)
    .refine((v) => v >= min && v <= max, `${label} debe estar entre ${min} y ${max}.`);
}

export function coordinateNumberSchema(kind: keyof typeof COORD_RANGES) {
  const { min, max, label } = COORD_RANGES[kind];
  return z
    .number()
    .refine((v) => Number.isFinite(v) && v >= min && v <= max, `${label} está fuera de rango (${min} a ${max}).`);
}

export function getFieldErrors(error: z.ZodError<Record<string, unknown>>): Record<string, string> {
  const { fieldErrors } = error.flatten();
  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) result[field] = messages[0];
  }
  return result;
}
