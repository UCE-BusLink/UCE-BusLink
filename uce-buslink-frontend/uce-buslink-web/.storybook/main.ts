import type { PluginOption } from 'vite';
import type { StorybookConfig } from '@storybook/react-vite';

// VitePWA registers several sub-plugins as a nested array, so pruning it
// requires flattening one level before filtering by name.
function withoutPwaPlugins(plugins: PluginOption[]): PluginOption[] {
  return plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) return withoutPwaPlugins(plugin);
    const name = plugin && !(plugin instanceof Promise) && 'name' in plugin ? plugin.name : '';
    return name.startsWith('vite-plugin-pwa') ? [] : [plugin];
  });
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  // The app's vite.config.ts registers vite-plugin-pwa, which tries to
  // precache Storybook's own build output and fails on large chunks.
  // It has no purpose inside Storybook, so it's stripped from the merged config.
  async viteFinal(config) {
    if (config.plugins) config.plugins = withoutPwaPlugins(config.plugins);
    return config;
  },
};

export default config;
