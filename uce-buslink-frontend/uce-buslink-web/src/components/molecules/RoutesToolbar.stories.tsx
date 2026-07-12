import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RoutesToolbar } from './RoutesToolbar';

const meta: Meta<typeof RoutesToolbar> = {
  title: 'Molecules/RoutesToolbar',
  component: RoutesToolbar,
  parameters: { layout: 'padded' },
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    onRefetch: fn(),
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof RoutesToolbar>;

export const Default: Story = {};

export const WithQuery: Story = {
  args: { searchQuery: 'Norte' },
};

export const Refreshing: Story = {
  args: { loading: true },
};
