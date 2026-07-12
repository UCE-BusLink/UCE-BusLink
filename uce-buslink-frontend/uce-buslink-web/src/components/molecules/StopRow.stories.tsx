import type { Meta, StoryObj } from '@storybook/react-vite';
import { StopRow } from './StopRow';
import type { RouteStopDetail } from '../../types';

const stops: RouteStopDetail[] = [
  { order: 1, name: 'Campus Central UCE', type: 'origin', lat: -0.19867, lng: -78.50325 },
  { order: 2, name: 'El Labrador', type: 'stop', lat: -0.15421, lng: -78.48671 },
  { order: 3, name: 'Terminal Carcelen', type: 'destination', lat: -0.09218, lng: -78.46293 },
];

const meta: Meta<typeof StopRow> = {
  title: 'Molecules/StopRow',
  component: StopRow,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof StopRow>;

export const Origin: Story = {
  args: { stop: stops[0], isLast: false },
};

export const Intermediate: Story = {
  args: { stop: stops[1], isLast: false },
};

export const Destination: Story = {
  args: { stop: stops[2], isLast: true },
};

export const FullTimeline: Story = {
  render: () => (
    <div className="w-80">
      {stops.map((stop, i) => (
        <StopRow key={stop.order} stop={stop} isLast={i === stops.length - 1} />
      ))}
    </div>
  ),
};
