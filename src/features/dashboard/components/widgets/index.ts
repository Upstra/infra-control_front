import type { Component } from 'vue';
import type { WidgetType } from '../../types';

import StatsWidget from './StatsWidget.vue';
import ActivityFeedWidget from './ActivityFeedWidget.vue';
import AlertsWidget from './AlertsWidget.vue';
import ResourceUsageWidget from './ResourceUsageWidget.vue';
import UserPresenceWidget from './UserPresenceWidget.vue';
import SystemHealthWidget from './SystemHealthWidget.vue';
import UpsStatusWidget from './UpsStatusWidget.vue';

export const widgetComponents: Record<WidgetType, Component> = {
  stats: StatsWidget,
  'ups-status': UpsStatusWidget,
  'activity-feed': ActivityFeedWidget,
  alerts: AlertsWidget,
  'resource-usage': ResourceUsageWidget,
  'user-presence': UserPresenceWidget,
  'system-health': SystemHealthWidget,
};
