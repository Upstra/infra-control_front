<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import AlertListItem from '@/features/alerts/components/bell/AlertListItem.vue';
import { useAlertsStore } from '@/features/alerts/store';

const { t } = useI18n();
const alerts = useAlertsStore();

const state = computed(() => {
  if (!alerts.summary && alerts.loading) return 'loading';
  if (!alerts.summary && alerts.error) return 'error';
  return alerts.open.length ? 'ready' : 'empty';
});
</script>

<template>
  <WidgetCard
    :title="t('widgets.types.alerts.label')"
    :meta="String(alerts.open.length)"
  >
    <WidgetStatus
      :state="state"
      :stale="alerts.stale"
      :empty-text="t('widgets.alerts.empty')"
      @retry="alerts.load"
    >
      <div class="-mx-3 flex flex-col">
        <AlertListItem
          v-for="alert in alerts.open"
          :key="alert.id"
          :alert="alert"
        />
      </div>
    </WidgetStatus>
  </WidgetCard>
</template>
