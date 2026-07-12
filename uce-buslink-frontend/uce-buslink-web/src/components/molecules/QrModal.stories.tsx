import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { QrModal } from './QrModal';

const meta: Meta<typeof QrModal> = {
  title: 'Molecules/QrModal',
  component: QrModal,
  parameters: { layout: 'fullscreen' },
  args: {
    qrCode: '8f21c4d0-7a3b-4e2f-9c1d-5b6a8e0f3d21',
    title: 'Ruta Nocturna Norte',
    subtitle: 'lun 13 jul, 21:30',
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof QrModal>;

export const Default: Story = {};

export const WithoutSubtitle: Story = {
  args: { subtitle: undefined },
};
