import { describe, it, expect } from 'vitest';
import { fmt, EMPTY, THIN_SPACE } from '../fmt';

describe('fmt', () => {
  it('renders null and undefined as an em dash, never 0', () => {
    expect(fmt.value(null, 'W')).toBe(EMPTY);
    expect(fmt.percent(undefined)).toBe(EMPTY);
    expect(fmt.minutes(null)).toBe(EMPTY);
    expect(fmt.clock(null)).toBe(EMPTY);
  });

  it('groups thousands and appends the unit with a thin non-breaking space', () => {
    expect(fmt.value(1840, 'W')).toBe(`1${THIN_SPACE}840${THIN_SPACE}W`);
    expect(fmt.minutes(14)).toBe(`14${THIN_SPACE}min`);
  });

  it('keeps a real zero as 0', () => {
    expect(fmt.value(0, 'V')).toBe(`0${THIN_SPACE}V`);
    expect(fmt.percent(0)).toBe(`0${THIN_SPACE}%`);
  });
});
