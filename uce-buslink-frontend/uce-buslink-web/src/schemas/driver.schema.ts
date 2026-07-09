import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .refine((v) => /[A-Z]/.test(v), 'La contraseña debe incluir una mayúscula.')
  .refine((v) => /[a-z]/.test(v), 'La contraseña debe incluir una minúscula.')
  .refine((v) => /[0-9]/.test(v), 'La contraseña debe incluir un número.')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'La contraseña debe incluir un carácter especial.');

export const driverFormSchema = z
  .object({
    nombres: z.string().trim().min(1, 'Los nombres son obligatorios.').max(80, 'Los nombres son demasiado largos.'),
    apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios.').max(80, 'Los apellidos son demasiado largos.'),
    email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma la contraseña.'),
    cedula: z.string().trim().regex(/^\d{10}$/, 'La cédula debe tener 10 dígitos.'),
    telefono: z.string().trim().regex(/^0\d{9}$/, 'El teléfono debe tener 10 dígitos y empezar con 0.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type DriverFormValues = z.output<typeof driverFormSchema>;
