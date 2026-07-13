import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bus } from 'lucide-react';
import { MetaCard } from './MetaCard';

const meta: Meta<typeof MetaCard> = {
  title: 'Atoms/MetaCard',
  component: MetaCard,
  parameters: { layout: 'centered' },
  args: {
    icon: <Bus size={20} />,
    label: 'Unidad',
    value: 'Bus 12',
  },
};

export default meta;
type Story = StoryObj<typeof MetaCard>;

export const Default: Story = {};
