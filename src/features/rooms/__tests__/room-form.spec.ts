import { describe, it, expect } from 'vitest';
import { toThresholds, validateThresholds } from '../domain/thresholds';

describe('room thresholds form', () => {
  it('refuses a warning threshold at or above the critical one', () => {
    expect(validateThresholds({ warn: '35', crit: '35' })).toBe(
      'warn_not_below_crit',
    );
    expect(validateThresholds({ warn: '40', crit: '35' })).toBe(
      'warn_not_below_crit',
    );
    expect(validateThresholds({ warn: '90', crit: '' })).toBe('out_of_range');
  });

  it('sends empty fields as null', () => {
    expect(toThresholds({ warn: '', crit: ' ' })).toEqual({
      inletWarnC: null,
      inletCritC: null,
    });
    expect(toThresholds({ warn: '28', crit: '33' })).toEqual({
      inletWarnC: 28,
      inletCritC: 33,
    });
  });

  // v-model on <input type="number"> turns typed values into numbers: the form
  // used to crash on `.trim()` and the whole thresholds card vanished.
  it('accepts the numbers v-model gives back from number inputs', () => {
    expect(validateThresholds({ warn: 28, crit: '' })).toBeNull();
    expect(validateThresholds({ warn: 40, crit: 35 })).toBe(
      'warn_not_below_crit',
    );
    expect(toThresholds({ warn: 28.5, crit: 33 })).toEqual({
      inletWarnC: 28.5,
      inletCritC: 33,
    });
  });
});
