import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TripCard } from './TripCard';
import type { Trip, Route } from '../../types';

const sampleRoute: Route = {
  id: 'norte',
  name: 'Ruta Nocturna Norte',
  destination: 'Carcelen',
  stops: [
    { name: 'Campus Central', type: 'origin' },
    { name: 'El Labrador', type: 'stop' },
    { name: 'Carcelen', type: 'destination' },
  ],
  departureTimes: ['21:00', '21:30'],
  availableSeats: 12,
  standingSpots: 8,
  distanceKm: 12.5,
  direction: 'north',
};

const sampleTrip: Trip = {
  id: 't1',
  routeId: 'norte',
  time: '21:30',
  driver: 'Carlos Ruiz',
  availableSeats: 12,
  standingSpots: 8,
  status: 'confirmed',
};

const meta: Meta<typeof TripCard> = {
  title: 'Molecules/TripCard',
  component: TripCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    trip: sampleTrip,
    route: sampleRoute,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TripCard>;

export const Default: Story = {};

export const FullCapacity: Story = {
  args: { trip: { ...sampleTrip, availableSeats: 0, standingSpots: 0 } },
};
