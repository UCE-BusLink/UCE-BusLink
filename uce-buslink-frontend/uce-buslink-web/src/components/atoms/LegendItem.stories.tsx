import type { Meta, StoryObj } from '@storybook/react-vite';
import { LegendItem } from './LegendItem';

const meta: Meta<typeof LegendItem> = {
  title: 'Atoms/LegendItem',
  component: LegendItem,
  parameters: { layout: 'centered' },
  args: {
    color: 'bg-green-400',
    label: 'Disponible',
  },
};

export default meta;
type Story = StoryObj<typeof LegendItem>;

export const Available: Story = {};

export const Occupied: Story = {
  args: { color: 'bg-red-400', label: 'Ocupado' },
};

export const Selected: Story = {
  args: { color: 'bg-navy-900', label: 'Seleccionado' },
};
