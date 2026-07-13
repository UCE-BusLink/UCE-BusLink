import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlidersHorizontal, AlertCircle, CalendarOff } from 'lucide-react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    icon: <SlidersHorizontal size={28} className="opacity-40" />,
    title: 'No hay rutas disponibles',
    description: 'Por el momento no existen rutas activas. Intenta mas tarde.',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    icon: <AlertCircle size={28} className="text-red-400" />,
    iconBg: 'bg-red-50',
    title: 'No se pudieron cargar las rutas',
    description: 'Error de conexion con el servidor.',
  },
};

export const NoDescription: Story = {
  args: {
    icon: <CalendarOff size={28} className="opacity-40" />,
    title: 'No tienes reservas activas',
    description: undefined,
  },
};
