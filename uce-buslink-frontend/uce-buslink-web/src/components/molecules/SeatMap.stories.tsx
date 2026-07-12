import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SeatMap } from './SeatMap';
import type { Seat } from '../../types';

function buildSeats(total: number, occupied: number[], selected?: number): Seat[] {
  return Array.from({ length: total }, (_, i) => {
    const number = i + 1;
    return {
      number,
      status: number === selected ? 'selected' : occupied.includes(number) ? 'occupied' : 'available',
    };
  });
}

const meta: Meta<typeof SeatMap> = {
  title: 'Molecules/SeatMap',
  component: SeatMap,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
  args: {
    seats: buildSeats(20, [1, 5, 12]),
    standingSpots: [],
    selectedStandingId: null,
    onSelectSeat: fn(),
    onSelectStanding: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SeatMap>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { seats: buildSeats(20, [1, 5, 12], 7) },
};

export const AlmostFull: Story = {
  args: { seats: buildSeats(20, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]) },
};
