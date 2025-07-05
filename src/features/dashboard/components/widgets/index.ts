import type { Component } from 'vue';
import type { WidgetType } from '../../types/widget';

import StatsWidget from './StatsWidget.vue';
import ServerStatusWidget from './ServerStatusWidget.vue';
import QuickActionsWidget from './QuickActionsWidget.vue';

export const widgetComponents: Record<WidgetType, Component> = {
  'stats': StatsWidget,
  'server-status': ServerStatusWidget,
  'quick-actions': QuickActionsWidget,
  'chart': {} as Component, // TODO: Implement
  'ups-status': {} as Component, // TODO: Implement
  'activity-feed': {} as Component, // TODO: Implement
  'alerts': {} as Component, // TODO: Implement
  'resource-usage': {} as Component, // TODO: Implement
  'user-presence': {} as Component, // TODO: Implement
  'system-health': {} as Component, // TODO: Implement
};