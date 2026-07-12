import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Phone, CreditCard, GraduationCap } from 'lucide-react';
import { ProfileInfoCard } from './ProfileInfoCard';

const meta: Meta<typeof ProfileInfoCard> = {
  title: 'Molecules/ProfileInfoCard',
  component: ProfileInfoCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Informacion personal',
    rows: [
      { icon: <Mail size={16} />, label: 'Correo institucional', value: 'ksrodriguez@uce.edu.ec' },
      { icon: <Phone size={16} />, label: 'Telefono', value: '+593 99 123 4567' },
      { icon: <CreditCard size={16} />, label: 'Cedula', value: '1712345678' },
      { icon: <GraduationCap size={16} />, label: 'Facultad', value: 'Ingenieria y Ciencias Aplicadas' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ProfileInfoCard>;

export const Default: Story = {};

export const SingleRow: Story = {
  args: {
    title: 'Contacto',
    rows: [{ icon: <Mail size={16} />, label: 'Correo', value: 'ksrodriguez@uce.edu.ec' }],
  },
};
