import type { Meta, StoryObj } from '@storybook/react-vite';
import { Users, Clock } from 'lucide-react';
import { StatBadge } from './StatBadge';

const meta: Meta<typeof StatBadge> = {
  title: 'Atoms/StatBadge',
  component: StatBadge,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: { control: 'select', options: ['green', 'amber'] },
  },
  args: {
    icon: <Users size={14} />,
    value: 12,
    label: 'asientos',
    tone: 'green',
  },
};

export default meta;
type Story = StoryObj<typeof StatBadge>;

export const Green: Story = {};

export const Amber: Story = {
  args: { icon: <Clock size={14} />, value: 3, label: 'min', tone: 'amber' },
};
