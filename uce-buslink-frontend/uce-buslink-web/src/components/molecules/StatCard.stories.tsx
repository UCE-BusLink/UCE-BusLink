import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Molecules/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-64 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Viajes completados',
    value: '24',
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const Highlighted: Story = {
  args: { label: 'Puntaje de confianza', value: '92%', valueClassName: 'text-emerald-600' },
};

export const NoValue: Story = {
  args: { label: 'Cancelaciones', value: null },
};
