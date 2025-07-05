import type { Component } from 'vue';
import type { WidgetType } from '../../types/widget';

import StatsWidget from './StatsWidget.vue';
import ServerStatusWidget from './ServerStatusWidget.vue';
import QuickActionsWidget from './QuickActionsWidget.vue';
import ActivityFeedWidget from './ActivityFeedWidget.vue';
import AlertsWidget from './AlertsWidget.vue';
import ResourceUsageWidget from './ResourceUsageWidget.vue';
import UserPresenceWidget from './UserPresenceWidget.vue';
import SystemHealthWidget from './SystemHealthWidget.vue';
import UpsStatusWidget from './UpsStatusWidget.vue';

export const widgetComponents: Record<WidgetType, Component> = {
  stats: StatsWidget,
  'server-status': ServerStatusWidget,
  'quick-actions': QuickActionsWidget,
  chart: {} as Component, // TODO: Implement
  'ups-status': UpsStatusWidget,
  'activity-feed': ActivityFeedWidget,
  alerts: AlertsWidget,
  'resource-usage': ResourceUsageWidget,
  'user-presence': UserPresenceWidget,
  'system-health': SystemHealthWidget,
};
