import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RouteTabBar } from './RouteTabBar';
import type { ApiRoute } from '../../types';

const routes: ApiRoute[] = [
  { id: 'r1', name: 'Ruta Norte', description: null, isActive: true, estimatedDurationMinutes: 35, pathPolyline: null, stops: null },
  { id: 'r2', name: 'Ruta Sur', description: null, isActive: true, estimatedDurationMinutes: 28, pathPolyline: null, stops: null },
  { id: 'r3', name: 'Ruta Valle', description: null, isActive: true, estimatedDurationMinutes: 45, pathPolyline: null, stops: null },
];

const meta: Meta<typeof RouteTabBar> = {
  title: 'Molecules/RouteTabBar',
  component: RouteTabBar,
  parameters: { layout: 'padded' },
  args: {
    routes,
    selectedId: 'r1',
    loading: false,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof RouteTabBar>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};
