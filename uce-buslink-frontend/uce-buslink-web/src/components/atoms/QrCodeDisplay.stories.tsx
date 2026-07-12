import type { Meta, StoryObj } from '@storybook/react-vite';
import { QrCodeDisplay } from './QrCodeDisplay';

const meta: Meta<typeof QrCodeDisplay> = {
  title: 'Atoms/QrCodeDisplay',
  component: QrCodeDisplay,
  parameters: { layout: 'centered' },
  args: {
    value: 'https://buslink.uce.edu.ec/reservation/8f21c4',
    size: 180,
  },
};

export default meta;
type Story = StoryObj<typeof QrCodeDisplay>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 100 },
};
