<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useDashboardStore } from '../store';
import DashboardGrid from '../components/layout/DashboardGrid.vue';
import { widgetComponents } from '../components/widgets';
import type { WidgetConfig, WidgetDefinition, WidgetType } from '../types/widget';
import { useI18n } from 'vue-i18n';

const dashboardStore = useDashboardStore();
const { t } = useI18n();

const editMode = ref(false);
const showWidgetCatalog = ref(false);
const selectedWidget = ref<WidgetConfig | null>(null);

const activeLayout = computed(() => dashboardStore.activeLayout);

const widgetDefinitions: WidgetDefinition[] = [
  {
    type: 'stats',
    name: 'Statistics',
    description: 'Display key metrics and statistics',
    defaultSize: 'large',
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    configurable: true,
    refreshable: true,
    icon: 'chart-bar',
  },
  {
    type: 'server-status',
    name: 'Server Status',
    description: 'Show server online/offline status',
    defaultSize: 'medium',
    minSize: { w: 3, h: 3 },
    maxSize: { w: 6, h: 6 },
    configurable: false,
    refreshable: true,
    icon: 'server',
  },
  {
    type: 'quick-actions',
    name: 'Quick Actions',
    description: 'Shortcuts to common actions',
    defaultSize: 'medium',
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
    configurable: true,
    refreshable: false,
    icon: 'lightning-bolt',
  },
];

onMounted(async () => {
  await dashboardStore.loadLayouts();
  await dashboardStore.fetchStats();
});

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    showWidgetCatalog.value = false;
  }
};

const handleUpdateLayout = (widgets: WidgetConfig[]) => {
  if (activeLayout.value) {
    dashboardStore.updateWidgetPositions(activeLayout.value.id, widgets);
  }
};

const handleRemoveWidget = (widgetId: string) => {
  if (activeLayout.value) {
    dashboardStore.removeWidget(activeLayout.value.id, widgetId);
  }
};

const handleEditWidget = (widgetId: string) => {
  const widget = activeLayout.value?.widgets.find(w => w.id === widgetId);
  if (widget) {
    selectedWidget.value = widget;
  }
};

const addWidget = (type: WidgetType) => {
  if (!activeLayout.value) return;

  const definition = widgetDefinitions.find(d => d.type === type);
  if (!definition) return;

  const newWidget: WidgetConfig = {
    id: `${type}-${Date.now()}`,
    type,
    title: definition.name,
    position: {
      x: 0,
      y: 0,
      w: definition.minSize.w,
      h: definition.minSize.h,
    },
    refreshInterval: definition.refreshable ? 30000 : undefined,
    visible: true,
  };

  dashboardStore.addWidget(activeLayout.value.id, newWidget);
  showWidgetCatalog.value = false;
};

const layoutOptions = computed(() => 
  dashboardStore.layouts.map(layout => ({
    value: layout.id,
    label: layout.name,
  }))
);

const handleLayoutChange = (layoutId: string) => {
  dashboardStore.setActiveLayout(layoutId);
};
</script>

<template>
  <div class="modular-dashboard p-6">
    <div class="dashboard-header mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          {{ t('dashboard.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ t('dashboard.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <select
          v-model="dashboardStore.activeLayoutId"
          @change="e => handleLayoutChange((e.target as HTMLSelectElement).value)"
          class="px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
        >
          <option v-for="option in layoutOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <button
          @click="toggleEditMode"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="editMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          {{ editMode ? t('dashboard.done_editing') : t('dashboard.edit_layout') }}
        </button>

        <button
          v-if="editMode"
          @click="showWidgetCatalog = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {{ t('dashboard.add_widget') }}
        </button>
      </div>
    </div>

    <div v-if="activeLayout" class="dashboard-content">
      <DashboardGrid
        :layout="activeLayout"
        :edit-mode="editMode"
        @update-layout="handleUpdateLayout"
        @remove-widget="handleRemoveWidget"
        @edit-widget="handleEditWidget"
      >
        <template #default="{ widget }">
          <component
            :is="widgetComponents[widget.type]"
            :config="widget"
          />
        </template>
      </DashboardGrid>
    </div>

    <!-- Widget Catalog Modal -->
    <div
      v-if="showWidgetCatalog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showWidgetCatalog = false"
    >
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">
          {{ t('dashboard.widget_catalog') }}
        </h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="definition in widgetDefinitions"
            :key="definition.type"
            @click="addWidget(definition.type)"
            class="widget-card p-4 border border-gray-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ definition.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ definition.description }}
                </p>
                <div class="flex gap-2 mt-2">
                  <span v-if="definition.configurable" class="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-700 rounded">
                    Configurable
                  </span>
                  <span v-if="definition.refreshable" class="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-700 rounded">
                    Auto-refresh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="showWidgetCatalog = false"
            class="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>