import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner, RouteCardSkeleton } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const CardSkeleton: Story = {
  render: () => (
    <div className="w-72">
      <RouteCardSkeleton />
    </div>
  ),
};
