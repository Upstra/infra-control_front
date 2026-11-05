import type { Component } from 'vue';
import {
  TriangleAlert,
  ChartColumn,
  BatteryCharging,
  Boxes,
  Server,
  History,
  Zap,
  Users,
  Bell,
  HeartPulse,
} from 'lucide-vue-next';
import type { PulseWidgetType } from '../../domain/catalog';

export const CATALOG_ICONS: Record<PulseWidgetType, Component> = {
  incident: TriangleAlert,
  kpis: ChartColumn,
  ups: BatteryCharging,
  vms: Boxes,
  hosts: Server,
  events: History,
  power: Zap,
  presence: Users,
  alerts: Bell,
  'system-health': HeartPulse,
};
