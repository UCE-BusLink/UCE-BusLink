import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RouteCard } from './RouteCard';
import type { ApiRoute } from '../../types';

const sampleRoute: ApiRoute = {
  id: 'route-1',
  name: 'Ruta Nocturna Norte',
  description: 'Recorrido nocturno desde el Campus Central hacia el sector norte de Quito.',
  isActive: true,
  estimatedDurationMinutes: 35,
  pathPolyline: null,
  stops: null,
};

const meta: Meta<typeof RouteCard> = {
  title: 'Molecules/RouteCard',
  component: RouteCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    route: sampleRoute,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof RouteCard>;

export const Compact: Story = {};

export const Full: Story = {
  args: { variant: 'full' },
};

export const WithoutDescription: Story = {
  args: {
    variant: 'full',
    route: { ...sampleRoute, description: null, estimatedDurationMinutes: null },
  },
};
