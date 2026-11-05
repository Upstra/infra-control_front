import { defineAsyncComponent, type Component } from 'vue';
import type { PulseWidgetType } from '../../domain/catalog';

export const WIDGET_COMPONENTS: Record<PulseWidgetType, Component> = {
  incident: defineAsyncComponent(() => import('./incident/IncidentWidget.vue')),
  kpis: defineAsyncComponent(() => import('./kpis/KpisWidget.vue')),
  ups: defineAsyncComponent(() => import('./ups/UpsWidget.vue')),
  vms: defineAsyncComponent(() => import('./vms/VmsWidget.vue')),
  hosts: defineAsyncComponent(() => import('./hosts/HostsWidget.vue')),
  events: defineAsyncComponent(() => import('./events/EventsWidget.vue')),
  power: defineAsyncComponent(() => import('./power/PowerWidget.vue')),
  presence: defineAsyncComponent(
    () => import('./shared/UnsupportedWidget.vue'),
  ),
  alerts: defineAsyncComponent(() => import('./alerts/AlertsWidget.vue')),
  'system-health': defineAsyncComponent(
    () => import('./health/SystemHealthWidget.vue'),
  ),
};
