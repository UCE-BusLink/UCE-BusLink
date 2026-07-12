import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bus, ShieldCheck, CalendarX } from 'lucide-react';
import { ProfileStatCard } from './ProfileStatCard';

const meta: Meta<typeof ProfileStatCard> = {
  title: 'Molecules/ProfileStatCard',
  component: ProfileStatCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: <Bus size={20} className="text-blue-600" />,
    value: '24',
    label: 'Viajes completados',
    accent: 'bg-blue-50',
  },
};

export default meta;
type Story = StoryObj<typeof ProfileStatCard>;

export const Trips: Story = {};

export const TrustScore: Story = {
  args: {
    icon: <ShieldCheck size={20} className="text-emerald-600" />,
    value: '92%',
    label: 'Puntaje de confianza',
    accent: 'bg-emerald-50',
  },
};

export const Cancellations: Story = {
  args: {
    icon: <CalendarX size={20} className="text-red-500" />,
    value: '2',
    label: 'Cancelaciones tardias',
    accent: 'bg-red-50',
  },
};
