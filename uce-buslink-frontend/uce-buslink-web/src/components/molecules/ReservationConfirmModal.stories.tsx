import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ReservationConfirmModal } from './ReservationConfirmModal';
import type { ApiReservation } from '../../types';

const sampleReservation: ApiReservation = {
  id: '8f21c4d0-7a3b-4e2f-9c1d-5b6a8e0f3d21',
  tripId: 'trip-1',
  seatId: 'seat-7',
  boardingStopId: 'stop-1',
  status: 'ACTIVE',
  qrCode: '8f21c4d0-7a3b-4e2f-9c1d-5b6a8e0f3d21',
};

const meta: Meta<typeof ReservationConfirmModal> = {
  title: 'Molecules/ReservationConfirmModal',
  component: ReservationConfirmModal,
  parameters: { layout: 'fullscreen' },
  args: {
    reservation: sampleReservation,
    seatNumber: 7,
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ReservationConfirmModal>;

export const Default: Story = {};
