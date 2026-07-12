import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BookingSummary } from './BookingSummary';

const meta: Meta<typeof BookingSummary> = {
  title: 'Molecules/BookingSummary',
  component: BookingSummary,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    routeName: 'Ruta Nocturna Norte',
    tripTime: '21:30',
    selectionLabel: 'Asiento 7',
    hasSelection: true,
    confirming: false,
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BookingSummary>;

export const WithSelection: Story = {};

export const NoSelection: Story = {
  args: { selectionLabel: null, hasSelection: false },
};

export const Confirming: Story = {
  args: { confirming: true },
};
