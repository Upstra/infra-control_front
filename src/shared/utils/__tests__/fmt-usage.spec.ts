import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HARDWARE_FIELDS = [
  'minutesRemaining',
  'batteryPercentage',
  'loadPercent',
  'inletC',
  'consumedW',
  'cpuPercent',
  'memoryPercent',
  'temperatureC',
  'realPowerW',
  'voltage',
  'runtimeSeconds',
  'chargePercent',
  'uptimeSeconds',
  'cpuUsage',
];

const ZERO_FALLBACK = new RegExp(
  `\\b(${HARDWARE_FIELDS.join('|')})\\)?\\s*(\\?\\?|\\|\\|)\\s*0\\b`,
);

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory())
      return entry === '__tests__' ? [] : sources(path);
    return /\.(vue|ts)$/.test(entry) ? [path] : [];
  });

describe('hardware values', () => {
  it('are never replaced by 0 when missing', () => {
    const offenders = sources(join(process.cwd(), 'src')).filter((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .some((line) => ZERO_FALLBACK.test(line)),
    );
    expect(offenders).toEqual([]);
  });

  it('flags a zero fallback on a nullable hardware field', () => {
    expect(ZERO_FALLBACK.test('const v = status.minutesRemaining ?? 0;')).toBe(
      true,
    );
    expect(
      ZERO_FALLBACK.test("fmt.value(status.minutesRemaining, 'min')"),
    ).toBe(false);
  });
});
