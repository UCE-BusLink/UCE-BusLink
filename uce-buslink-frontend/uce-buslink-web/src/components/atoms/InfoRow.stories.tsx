import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapPin } from 'lucide-react';
import { InfoRow } from './InfoRow';

const meta: Meta<typeof InfoRow> = {
  title: 'Atoms/InfoRow',
  component: InfoRow,
  parameters: { layout: 'padded' },
  args: {
    icon: <MapPin size={16} />,
    label: 'Parada',
    value: 'Facultad de Ingeniería',
  },
};

export default meta;
type Story = StoryObj<typeof InfoRow>;

export const Default: Story = {};
