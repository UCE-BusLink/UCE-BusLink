import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileHeroCard } from './ProfileHeroCard';

const meta: Meta<typeof ProfileHeroCard> = {
  title: 'Molecules/ProfileHeroCard',
  component: ProfileHeroCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
  args: {
    fullName: 'Kennet Steveen Rodriguez',
    email: 'ksrodriguez@uce.edu.ec',
    initials: 'KR',
    avatarUrl: undefined,
    roleLabel: 'Estudiante',
  },
};

export default meta;
type Story = StoryObj<typeof ProfileHeroCard>;

export const WithInitials: Story = {};

export const Driver: Story = {
  args: {
    fullName: 'Carlos Ruiz',
    email: 'carlos.ruiz@uce.edu.ec',
    initials: 'CR',
    roleLabel: 'Conductor',
  },
};
