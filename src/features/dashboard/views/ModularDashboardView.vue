<template>
  <div class="modular-dashboard p-3 sm:p-6">
    <div
      class="dashboard-header mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          {{ t('dashboard.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ t('dashboard.subtitle') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          @click="showLayoutManager = true"
          class="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors text-sm sm:text-base"
        >
          <Icon
            name="layout"
            class="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2"
          />
          <span class="hidden sm:inline">{{
            t('dashboard.manage_layouts')
          }}</span>
          <span class="sm:hidden">{{ t('dashboard.layouts') }}</span>
        </button>

        <button
          @click="toggleEditMode"
          class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
          :class="
            editMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
          "
        >
          <Icon
            name="edit"
            class="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2"
          />
          <span class="hidden sm:inline">{{
            editMode ? t('dashboard.done_editing') : t('dashboard.edit_layout')
          }}</span>
          <span class="sm:hidden">{{
            editMode ? t('dashboard.done') : t('dashboard.edit')
          }}</span>
        </button>

        <button
          v-if="editMode"
          @click="showWidgetCatalog = true"
          class="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
        >
          <Icon
            name="plus"
            class="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2"
          />
          <span class="hidden sm:inline">{{ t('dashboard.add_widget') }}</span>
          <span class="sm:hidden">{{ t('dashboard.add') }}</span>
        </button>

        <button
          @click="showPreferences = true"
          class="p-1.5 sm:p-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
        >
          <Icon name="settings" class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="text-center text-red-500 dark:text-red-400 p-8"
    >
      <Icon name="alert-circle" class="h-12 w-12 mx-auto mb-4" />
      <p>{{ t('dashboard.error.loading') }}</p>
      <button
        @click="loadDashboard"
        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        {{ t('common.retry') }}
      </button>
    </div>

    <div v-else-if="activeLayout" class="dashboard-content">
      <DashboardGrid
        :layout="activeLayout"
        :edit-mode="editMode"
        @update-layout="handleUpdateLayout"
        @remove-widget="handleRemoveWidget"
        @edit-widget="handleEditWidget"
      >
        <template #default="{ widget }">
          <component
            :is="widgetComponents[widget.type as keyof typeof widgetComponents]"
            :config="widget"
            @close="handleRemoveWidget(widget.id)"
            @settings="handleEditWidget(widget.id)"
          />
        </template>
      </DashboardGrid>
    </div>

    <div v-else class="text-center p-8">
      <Icon name="layout" class="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ t('dashboard.no_layout') }}
      </p>
      <button
        @click="createFirstLayout"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        {{ t('dashboard.create_first_layout') }}
      </button>
    </div>

    <div
      v-if="showWidgetCatalog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showWidgetCatalog = false"
    >
      <div
        class="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4"
      >
        <h2 class="text-2xl font-bold mb-4 dark:text-white">
          {{ t('dashboard.widget_catalog') }}
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          <div
            v-for="definition in widgetDefinitions"
            :key="definition.type"
            @click="addWidget(definition.type)"
            class="widget-card p-4 border border-gray-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon
                  :name="definition.icon"
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ t(`dashboard.widgets.${definition.type}.name`) }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ t(`dashboard.widgets.${definition.type}.description`) }}
                </p>
                <div class="flex gap-2 mt-2">
                  <span
                    v-if="definition.configurable"
                    class="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-700 rounded"
                  >
                    {{ t('dashboard.widgets.configurable') }}
                  </span>
                  <span
                    v-if="definition.refreshable"
                    class="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-700 rounded"
                  >
                    {{ t('dashboard.widgets.autoRefresh') }}
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

    <Modal
      v-if="showLayoutManager"
      @close="showLayoutManager = false"
      size="xl"
    >
      <template #header>
        {{ t('dashboard.layoutsConfig.title') }}
      </template>
      <LayoutManager />
    </Modal>

    <Modal v-if="selectedWidget" @close="selectedWidget = null">
      <template #header>
        {{ t('dashboard.widget_settings') }}
      </template>

      <div class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.widget_title') }}
          </label>
          <input
            v-model="widgetEditForm.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <div v-if="selectedWidgetDefinition?.refreshable">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.refresh_interval') }}
          </label>
          <select
            v-model.number="widgetEditForm.refreshInterval"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option :value="0">{{ t('dashboard.refresh_disabled') }}</option>
            <option :value="30000">30 {{ t('common.seconds') }}</option>
            <option :value="60000">1 {{ t('common.minute') }}</option>
            <option :value="300000">5 {{ t('common.minutes') }}</option>
            <option :value="600000">10 {{ t('common.minutes') }}</option>
          </select>
        </div>

        <div class="flex items-center">
          <input
            v-model="widgetEditForm.visible"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            {{ t('dashboard.widget_visible') }}
          </label>
        </div>
      </div>

      <template #footer>
        <button
          @click="selectedWidget = null"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="saveWidgetSettings"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {{ t('common.save') }}
        </button>
      </template>
    </Modal>

    <Modal v-if="showPreferences" @close="showPreferences = false">
      <template #header>
        {{ t('dashboard.preferences.title') }}
      </template>

      <div class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.preferences.defaultRefresh') }}
          </label>
          <select
            v-model.number="preferencesForm.refreshInterval"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option :value="30000">30 {{ t('common.seconds') }}</option>
            <option :value="60000">1 {{ t('common.minute') }}</option>
            <option :value="300000">5 {{ t('common.minutes') }}</option>
            <option :value="600000">10 {{ t('common.minutes') }}</option>
          </select>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('dashboard.preferences.notifications') }}
          </h4>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="preferencesForm.notifications!.alerts"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ t('dashboard.preferences.alertNotifications') }}
              </span>
            </label>
            <label class="flex items-center">
              <input
                v-model="preferencesForm.notifications!.activities"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ t('dashboard.preferences.activityNotifications') }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="showPreferences = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="savePreferences"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {{ t('common.save') }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../store';
import DashboardGrid from '../components/layout/DashboardGrid.vue';
import LayoutManager from '../components/layout/LayoutManager.vue';
import Modal from '@/shared/components/Modal.vue';
import Icon from '@/shared/components/Icon.vue';
import { widgetComponents } from '../components/widgets';
import type { Widget, DashboardPreferences, WidgetType } from '../types';

interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  defaultSize: 'small' | 'medium' | 'large';
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
  configurable: boolean;
  refreshable: boolean;
  icon: string;
}

const dashboardStore = useDashboardStore();
const { t } = useI18n();

const editMode = ref(false);
const showWidgetCatalog = ref(false);
const showLayoutManager = ref(false);
const showPreferences = ref(false);
const selectedWidget = ref<Widget | null>(null);
const loading = ref(true);
const error = ref(false);

const activeLayout = computed(() => dashboardStore.activeLayout);
const preferences = computed(() => dashboardStore.preferences);

const widgetEditForm = ref({
  title: '',
  refreshInterval: 0,
  visible: true,
});

const preferencesForm = ref<Partial<DashboardPreferences>>({
  refreshInterval: 30000,
  notifications: {
    alerts: true,
    activities: false,
  },
});

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
    type: 'activity-feed',
    name: 'Activity Feed',
    description: 'Recent activity in the system',
    defaultSize: 'medium',
    minSize: { w: 4, h: 4 },
    maxSize: { w: 6, h: 8 },
    configurable: true,
    refreshable: true,
    icon: 'activity',
  },
  {
    type: 'alerts',
    name: 'Alerts',
    description: 'System alerts and warnings',
    defaultSize: 'medium',
    minSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 6 },
    configurable: true,
    refreshable: true,
    icon: 'alert-triangle',
  },
  {
    type: 'resource-usage',
    name: 'Resource Usage',
    description: 'CPU, memory, storage and network usage',
    defaultSize: 'large',
    minSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
    configurable: true,
    refreshable: true,
    icon: 'cpu',
  },
  {
    type: 'user-presence',
    name: 'User Presence',
    description: 'Online users and activity',
    defaultSize: 'small',
    minSize: { w: 3, h: 4 },
    maxSize: { w: 4, h: 6 },
    configurable: true,
    refreshable: true,
    icon: 'users',
  },
  {
    type: 'system-health',
    name: 'System Health',
    description: 'Overall system health status',
    defaultSize: 'medium',
    minSize: { w: 4, h: 4 },
    maxSize: { w: 6, h: 6 },
    configurable: false,
    refreshable: true,
    icon: 'heart',
  },
  {
    type: 'ups-status',
    name: 'UPS Status',
    description: 'UPS devices status and metrics',
    defaultSize: 'large',
    minSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
    configurable: true,
    refreshable: true,
    icon: 'battery',
  },
];

const selectedWidgetDefinition = computed(() => {
  if (!selectedWidget.value) return null;
  return widgetDefinitions.find((d) => d.type === selectedWidget.value?.type);
});

const loadDashboard = async () => {
  try {
    loading.value = true;
    error.value = false;

    await Promise.all([
      dashboardStore.loadLayouts(),
      dashboardStore.loadPreferences(),
      dashboardStore.fetchStats(),
    ]);
  } catch (err) {
    console.error('Error loading dashboard:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    showWidgetCatalog.value = false;
  }
};

const handleUpdateLayout = async (widgets: Widget[]) => {
  if (activeLayout.value) {
    await dashboardStore.updateWidgetPositions(activeLayout.value.id, widgets);
  }
};

const handleRemoveWidget = async (widgetId: string) => {
  if (activeLayout.value) {
    await dashboardStore.removeWidget(activeLayout.value.id, widgetId);
  }
};

const handleEditWidget = (widgetId: string) => {
  const widget = activeLayout.value?.widgets.find((w) => w.id === widgetId);
  if (widget) {
    selectedWidget.value = widget;
    widgetEditForm.value = {
      title: widget.title || '',
      refreshInterval: widget.refreshInterval || 0,
      visible: widget.visible !== false,
    };
  }
};

const saveWidgetSettings = async () => {
  if (!selectedWidget.value || !activeLayout.value) return;

  await dashboardStore.updateWidget(
    activeLayout.value.id,
    selectedWidget.value.id,
    widgetEditForm.value,
  );
  selectedWidget.value = null;
};

const addWidget = async (type: WidgetType) => {
  if (!activeLayout.value) return;

  const definition = widgetDefinitions.find((d) => d.type === type);
  if (!definition) return;

  const newWidget: Widget = {
    id: crypto.randomUUID(),
    type,
    position: {
      x: 0,
      y: 0,
      w: definition.minSize.w,
      h: definition.minSize.h,
    },
    settings: {},
    title: t(`dashboard.widgets.${type}.name`),
    refreshInterval: definition.refreshable ? 30000 : undefined,
    visible: true,
  };

  await dashboardStore.addWidget(activeLayout.value.id, newWidget);
  showWidgetCatalog.value = false;
};

const createFirstLayout = async () => {
  await dashboardStore.addLayout({
    name: t('dashboard.layoutsConfig.myDashboard'),
    columns: 12,
    rowHeight: 80,
    isDefault: true,
    widgets: [],
  });
};

const savePreferences = async () => {
  await dashboardStore.updatePreferences(preferencesForm.value);
  showPreferences.value = false;
};

watch(preferences, (newPrefs) => {
  if (newPrefs && newPrefs.notifications) {
    preferencesForm.value = {
      refreshInterval: newPrefs.refreshInterval,
      notifications: { ...newPrefs.notifications },
    };
  }
});

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
@media (min-width: 640px) {
  .widget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 639px) {
  .widget-card {
    @apply shadow-sm;
  }
}
</style>
