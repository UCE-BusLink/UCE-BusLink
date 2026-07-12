import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SeatButton } from './SeatButton';

const meta: Meta<typeof SeatButton> = {
  title: 'Atoms/SeatButton',
  component: SeatButton,
  parameters: { layout: 'centered' },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SeatButton>;

export const Available: Story = {
  args: { seat: { number: 4, status: 'available' } },
};

export const Occupied: Story = {
  args: { seat: { number: 7, status: 'occupied' } },
};

export const Selected: Story = {
  args: { seat: { number: 12, status: 'selected' } },
};
