import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DriverTripCard } from './DriverTripCard';
import type { DriverTripView } from '../../types';

const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const sampleTrip: DriverTripView = {
  id: 'trip-1',
  routeId: 'route-1',
  routeName: 'Ruta Nocturna Norte',
  busId: 'bus-1',
  state: 'SCHEDULED',
  departureTime: inTwoHours,
  availableSeats: 34,
};

const meta: Meta<typeof DriverTripCard> = {
  title: 'Molecules/DriverTripCard',
  component: DriverTripCard,
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
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DriverTripCard>;

export const Scheduled: Story = {};

export const Ongoing: Story = {
  args: { trip: { ...sampleTrip, state: 'ONGOING' } },
};

export const Completed: Story = {
  args: { trip: { ...sampleTrip, state: 'COMPLETED', departureTime: yesterday } },
};

export const Cancelled: Story = {
  args: { trip: { ...sampleTrip, state: 'CANCELLED', departureTime: yesterday } },
};
