import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { WeekDayPicker } from './WeekDayPicker';
import type { WeekDay } from '../../types';

const days: WeekDay[] = [
  { label: 'Lun', day: 6, isToday: false, hasTrips: true },
  { label: 'Mar', day: 7, isToday: false, hasTrips: false },
  { label: 'Mie', day: 8, isToday: true, hasTrips: true },
  { label: 'Jue', day: 9, isToday: false, hasTrips: true },
  { label: 'Vie', day: 10, isToday: false, hasTrips: false },
  { label: 'Sab', day: 11, isToday: false, hasTrips: false },
  { label: 'Dom', day: 12, isToday: false, hasTrips: false },
];

const meta: Meta<typeof WeekDayPicker> = {
  title: 'Molecules/WeekDayPicker',
  component: WeekDayPicker,
  parameters: { layout: 'padded' },
  args: {
    days,
    selectedIndex: 2,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WeekDayPicker>;

export const Default: Story = {};

export const WithWeekNavigation: Story = {
  args: { weekOffset: 0, onWeekChange: fn() },
};

export const NextWeek: Story = {
  args: { weekOffset: 1, onWeekChange: fn(), selectedIndex: 0 },
};
