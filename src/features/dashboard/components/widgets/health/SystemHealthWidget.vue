<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { StatusPill, type HealthState } from '@/shared/components/pulse';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import { dashboardApi } from '../../../api';
import { fmt } from '@/shared/utils/fmt';
import type { SystemComponent, SystemHealthResponse } from '../../../types';

const STATE: Record<SystemComponent['status'], HealthState> = {
  operational: 'up',
  degraded: 'degraded',
  down: 'down',
};

const { t, te } = useI18n();

// The backend sends a stable key; older backends only send an English name.
const label = (component: SystemComponent) => {
  const key = `widgets.system_health.components.${component.key}`;
  return component.key && te(key) ? t(key) : component.name;
};
const health = ref<SystemHealthResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const load = async () => {
  loading.value = true;
  try {
    health.value = await dashboardApi.getSystemHealth();
    error.value = null;
  } catch (e: any) {
    error.value = e?.message ?? 'health';
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const state = computed(() => {
  if (!health.value) return error.value ? 'error' : 'loading';
  return health.value.components.length ? 'ready' : 'empty';
});
</script>

<template>
  <WidgetCard :title="t('widgets.types.system-health.label')">
    <WidgetStatus :state="state" @retry="load">
      <ul class="m-0 flex list-none flex-col gap-3 p-0">
        <li
          v-for="component in health?.components ?? []"
          :key="component.name"
          class="flex flex-wrap items-center gap-3 border-t border-border pt-3 first:border-0 first:pt-0"
        >
          <span class="flex-1 font-medium text-text-strong">{{
            label(component)
          }}</span>
          <StatusPill
            :state="STATE[component.status]"
            :label="t(`widgets.system_health.status.${component.status}`)"
            bare
          />
          <span
            class="w-full font-mono text-caption text-text-muted tnum"
            :title="component.detail"
          >
            <template v-if="component.status !== 'operational' && component.detail">
              {{ component.detail }} ·
            </template>
            {{ t('widgets.system_health.response') }}
            {{ fmt.value(component.responseTime, 'ms') }}
          </span>
        </li>
      </ul>
    </WidgetStatus>
  </WidgetCard>
</template>
