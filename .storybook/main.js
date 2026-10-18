// Storybook configuration for helix-design (dev tooling only; not part of the published package).
/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
};

export default config;
