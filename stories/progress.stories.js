import { cx, describe, esc } from './helpers.js';

const RINGS = { default: '', small: 'hx-progress-ring--sm', idle: 'hx-progress-ring--idle', over: 'hx-progress-ring--over' };
const BARS = { default: '', high: 'hx-progress-bar--high', over: 'hx-progress-bar--over', thin: 'hx-progress-bar--thin' };

const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));

const ring = ({ value, kind, label }) => `
  <div class="${cx('hx-progress-ring', RINGS[kind])}" style="--value: ${clamp(value)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${clamp(value)}">
    <div class="hx-progress-ring__label"><strong class="hx-num">${clamp(value)}%</strong>${label ? `<span>${esc(label)}</span>` : ''}</div>
  </div>`;

const bar = ({ value, kind, label }) => `
  <div class="sb-stack">
    <div><div class="hx-progress-head"><span>${esc(label)}</span><span class="hx-num">${clamp(value)} / 100</span></div>
    <div class="${cx('hx-progress-bar', BARS[kind])}" style="--value: ${clamp(value)}" role="progressbar" aria-valuenow="${clamp(value)}" aria-valuemin="0" aria-valuemax="100"></div></div>
  </div>`;

const value = { control: { type: 'range', min: 0, max: 100, step: 1 } };

export default {
  title: 'Components/Progress',
  parameters: describe('CSS only. Set `--value` (0-100) inline and mirror it in `aria-valuenow`.'),
};

export const Ring = {
  render: ring,
  argTypes: { value, kind: { control: 'inline-radio', options: Object.keys(RINGS) }, label: { control: 'text' } },
  args: { value: 58, kind: 'default', label: 'Progress' },
};

export const RingEmpty = { ...Ring, args: { ...Ring.args, value: 0, label: 'Empty' } };

export const RingComplete = { ...Ring, args: { ...Ring.args, value: 100, label: 'Complete' } };

export const RingIdle = { ...Ring, args: { ...Ring.args, value: 35, kind: 'idle', label: 'Idle' } };

export const RingOver = { ...Ring, args: { ...Ring.args, value: 100, kind: 'over', label: 'Over' } };

export const RingSmall = { ...Ring, args: { ...Ring.args, value: 72, kind: 'small', label: '' } };

export const Bar = {
  render: bar,
  argTypes: { value, kind: { control: 'inline-radio', options: Object.keys(BARS) }, label: { control: 'text' } },
  args: { value: 40, kind: 'default', label: 'Default' },
};

export const BarEmpty = { ...Bar, args: { ...Bar.args, value: 0, label: 'Empty' } };

export const BarHigh = { ...Bar, args: { ...Bar.args, value: 85, kind: 'high', label: 'High' } };

export const BarOver = { ...Bar, args: { ...Bar.args, value: 100, kind: 'over', label: 'Over' } };

export const BarThin = { ...Bar, args: { ...Bar.args, value: 60, kind: 'thin', label: 'Thin' } };

export const Steps = {
  render: () => `
    <div class="sb-stack"><div><div class="hx-progress-head"><span>Steps</span><span class="hx-num">3 / 5</span></div>
    <div class="hx-progress-steps" aria-label="Step 3 of 5"><i class="hx-is-done"></i><i class="hx-is-done"></i><i class="hx-is-current"></i><i></i><i></i></div></div></div>`,
};
