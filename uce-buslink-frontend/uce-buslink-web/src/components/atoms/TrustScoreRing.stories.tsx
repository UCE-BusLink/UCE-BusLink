import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrustScoreRing } from './TrustScoreRing';

const meta: Meta<typeof TrustScoreRing> = {
  title: 'Atoms/TrustScoreRing',
  component: TrustScoreRing,
  parameters: { layout: 'centered' },
  args: {
    score: 82,
  },
};

export default meta;
type Story = StoryObj<typeof TrustScoreRing>;

export const Default: Story = {};

export const Low: Story = {
  args: { score: 24 },
};

export const NoData: Story = {
  args: { score: null },
};
