<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Thermometer, Zap, Radar } from 'lucide-vue-next';
import { KpiTile } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import { FALLBACK_WARN_C, isInletWarning } from '../domain/thresholds';
import type { RoomEnvironment, RoomThresholds } from '../types';

const props = defineProps<{
  environment: RoomEnvironment;
  thresholds: RoomThresholds;
  serverName: string | null;
}>();

const { t } = useI18n();

const warning = computed(() =>
  isInletWarning(props.environment.maxInletC, props.thresholds.inletWarnC),
);
const threshold = computed(
  () => props.thresholds.inletWarnC ?? FALLBACK_WARN_C,
);
const coverageNote = computed(() =>
  props.environment.serversWithIlo
    ? t(
        'roomsPage.environment.coverage_note',
        {
          reporting: props.environment.serversReporting,
          total: props.environment.serversWithIlo,
        },
        props.environment.serversReporting,
      )
    : t('roomsPage.environment.coverage_none'),
);
</script>

<template>
  <section
    :aria-label="t('roomsPage.environment.title')"
    class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5"
  >
    <KpiTile
      :icon="Thermometer"
      :label="t('roomsPage.environment.inlet')"
      :value="fmt.number(environment.maxInletC)"
      :suffix="t('roomsPage.environment.inlet_threshold', { threshold })"
      :state="warning ? 'warning' : 'ok'"
      :note="
        warning
          ? serverName
          : environment.maxInletC === null
            ? null
            : t('roomsPage.environment.inlet_ok')
      "
      data-kpi="inlet"
    />
    <KpiTile
      :icon="Zap"
      :label="t('roomsPage.environment.power')"
      :value="fmt.number(environment.totalConsumedW)"
      suffix="W"
      :note="t('roomsPage.environment.power_note')"
      note-state="unknown"
    />
    <KpiTile
      :icon="Radar"
      :label="t('roomsPage.environment.coverage')"
      :value="String(environment.serversReporting)"
      :suffix="
        t('roomsPage.environment.coverage_suffix', {
          total: environment.serversWithIlo,
        })
      "
      :note="coverageNote"
      :note-state="
        environment.serversReporting < environment.serversWithIlo
          ? 'degraded'
          : 'up'
      "
    />
  </section>
</template>
