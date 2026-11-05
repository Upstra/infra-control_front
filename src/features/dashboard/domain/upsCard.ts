import { reaches } from '@/shared/utils/thresholds';
import { fmt } from '@/shared/utils/fmt';
import {
  CONDITION_HEALTH,
  CONDITION_RANK,
  showsReadings,
  upsCondition,
  type UpsCondition,
} from '@/features/ups/domain/condition';
import type { HealthState } from '@/shared/components/pulse';
import type { BatteryStatus, UpsResponseDto } from '@/features/ups/types';

export type Emphasis = 'normal' | 'warning' | 'danger';

export interface UpsCardModel {
  id: string;
  name: string;
  model: string | null;
  battery: number | null;
  condition: UpsCondition;
  health: HealthState;
  pillDetail: string | null;
  load: { text: string; emphasis: Emphasis };
  runtime: { text: string; emphasis: Emphasis };
  temperature: { text: string; emphasis: Emphasis };
  input: { text: string; emphasis: Emphasis };
}

const LOAD_WARN_PERCENT = 80;

const pillDetail = (condition: UpsCondition, status: BatteryStatus | null) => {
  if (!status) return null;
  if (condition === 'on_battery') return fmt.minutes(status.minutesRemaining);
  if (condition === 'charging') return fmt.percent(status.batteryPercentage);
  return null;
};

export const upsCardModel = (
  ups: UpsResponseDto,
  status: BatteryStatus | null,
  unreachable = false,
): UpsCardModel => {
  const condition = upsCondition(status, unreachable);
  const readings = showsReadings(condition) ? status : null;
  const telemetry = readings?.telemetry ?? null;
  const loadPercent = readings?.loadPercent ?? null;
  const onBattery = condition === 'on_battery';
  const inputVoltage = telemetry?.input.voltage ?? null;
  const device = telemetry?.device;
  return {
    id: ups.id,
    name: ups.name,
    model:
      [device?.manufacturer, device?.model].filter(Boolean).join(' ') || null,
    battery: readings?.batteryPercentage ?? null,
    condition,
    health: CONDITION_HEALTH[condition],
    pillDetail: pillDetail(condition, readings),
    load: {
      text:
        telemetry?.load.realPowerW != null
          ? fmt.value(telemetry.load.realPowerW, 'W')
          : fmt.percent(loadPercent),
      emphasis:
        condition === 'overload' || reaches(loadPercent, LOAD_WARN_PERCENT)
          ? 'warning'
          : 'normal',
    },
    runtime: {
      text: fmt.minutes(readings?.minutesRemaining),
      emphasis: onBattery ? 'danger' : 'normal',
    },
    temperature: {
      text: fmt.value(telemetry?.temperatureC, '°C'),
      emphasis: 'normal',
    },
    input: {
      text: fmt.value(inputVoltage, 'V'),
      emphasis: onBattery || inputVoltage === 0 ? 'danger' : 'normal',
    },
  };
};

export const sortUpsCards = (cards: UpsCardModel[]) =>
  [...cards].sort(
    (a, b) =>
      CONDITION_RANK[a.condition] - CONDITION_RANK[b.condition] ||
      a.name.localeCompare(b.name),
  );
