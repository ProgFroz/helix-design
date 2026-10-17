import '../dist/helix-design.css';
// The old demo loaded the opt-in element base on every page, so Storybook does too.
import '../dist/helix-base.css';
import './preview.css';
import { themes } from 'storybook/theming';
import tokensCss from '../src/tokens.css?raw';
import { BUTTON_VARIANTS, DEFAULT_BUTTON_VARIANT } from './toolbar.mjs';
import { parseTokens } from './tokens.mjs';

// Pantheon backdrop: the --stone token, read from tokens.css. There is no light option.
const STONE = parseTokens(tokensCss).find((t) => t.name === '--stone').value;

const isVariant = (value) => BUTTON_VARIANTS.some((item) => item.value === value);

// The library reads the button variant from <html data-btn>; set it for every story and docs page.
const withButtonVariant = (storyFn, context) => {
  const value = context.globals.btn;
  document.documentElement.dataset.btn = isVariant(value) ? value : DEFAULT_BUTTON_VARIANT;
  return storyFn();
};

const preview = {
  decorators: [withButtonVariant],
  globalTypes: {
    btn: {
      description: 'Button variant (sets data-btn on the preview <html>)',
      toolbar: { title: 'Buttons', icon: 'paintbrush', items: BUTTON_VARIANTS, dynamicTitle: true },
    },
  },
  initialGlobals: {
    btn: DEFAULT_BUTTON_VARIANT,
    backgrounds: { value: 'pantheon' },
  },
  parameters: {
    backgrounds: {
      options: { pantheon: { name: 'Pantheon (--stone)', value: STONE } },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        breakpoint: { name: 'Breakpoint 1100', styles: { width: '1100px', height: '800px' }, type: 'tablet' },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
    docs: { theme: themes.dark },
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default preview;
