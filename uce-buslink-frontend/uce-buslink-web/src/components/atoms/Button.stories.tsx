import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    children: 'Confirmar',
    variant: 'primary',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ver detalles' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
