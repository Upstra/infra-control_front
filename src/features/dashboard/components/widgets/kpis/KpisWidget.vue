<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Server, Boxes, Thermometer, Zap } from 'lucide-vue-next';
import { KpiTile } from '@/shared/components/pulse';
import WidgetStatus from '../shared/WidgetStatus.vue';
import { dataState } from '../shared/dataState';
import { useFullStats } from '../../../composables/useFullStats';
import {
  inletThreshold,
  isInletHot,
  powerShare,
  vmTotals,
} from '../../../domain/kpis';
import { fmt } from '@/shared/utils/fmt';

const { t } = useI18n();
const source = useFullStats();
const { stats, room, loading, loaded, error } = source;

const state = computed(() =>
  dataState(
    { loading: loading.value, loaded: loaded.value, error: error.value },
    false,
  ),
);

const hosts = computed(() => {
  const s = stats.value;
  const total = s?.hostsTotal ?? null;
  const connected = s?.hostsConnected ?? null;
  const missing =
    total !== null && connected !== null ? Math.max(0, total - connected) : 0;
  return {
    value: fmt.number(connected),
    suffix: total === null ? null : `/ ${total}`,
    note: missing
      ? t('widgets.kpis.hosts_missing', missing)
      : t('widgets.kpis.hosts_ok'),
    noteState: missing ? ('down' as const) : ('up' as const),
  };
});

const vms = computed(() => {
  const totals = stats.value ? vmTotals(stats.value) : null;
  if (!totals)
    return {
      value: fmt.number(null),
      suffix: null,
      note: null,
      noteState: 'unknown' as const,
    };
  const fine = totals.down === 0 && totals.issues === 0;
  return {
    value: fmt.number(totals.running),
    suffix: `/ ${totals.total}`,
    note: fine
      ? t('widgets.kpis.vms_ok')
      : t(
          'widgets.kpis.vms_down',
          { down: totals.down, issues: totals.issues },
          totals.down,
        ),
    noteState: totals.down
      ? ('down' as const)
      : fine
        ? ('up' as const)
        : ('degraded' as const),
  };
});

const temp = computed(() => {
  const s = stats.value;
  if (!s) return null;
  const inputs = {
    stats: s,
    inletWarnC: room.value?.inletWarnC,
    roomName: room.value?.name ?? null,
  };
  const hot = isInletHot(inputs);
  const where = s.maxInletServerName
    ? t('widgets.kpis.temp_where', {
        server: s.maxInletServerName,
        room: room.value?.name ?? fmt.value(null),
      })
    : null;
  return {
    value: fmt.number(s.maxInletC),
    suffix: t('widgets.kpis.temp_threshold', {
      threshold: inletThreshold(inputs.inletWarnC),
    }),
    hot,
    note: hot ? where : t('widgets.kpis.temp_ok'),
  };
});

const power = computed(() => {
  const s = stats.value;
  const share = s ? powerShare(s) : null;
  return {
    value: fmt.number(s?.totalPowerW),
    suffix:
      share === null
        ? t('widgets.kpis.power_no_capacity')
        : `W · ${fmt.percent(share)}`,
    progress: share,
  };
});
</script>

<template>
  <section :aria-label="t('widgets.kpis.region')" class="flex flex-col gap-3">
    <WidgetStatus :state="state" :lines="2" @retry="source.load">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
        <KpiTile
          :icon="Server"
          :label="t('widgets.kpis.hosts')"
          :value="hosts.value"
          :suffix="hosts.suffix"
          :note="hosts.note"
          :note-state="hosts.noteState"
        />
        <KpiTile
          :icon="Boxes"
          :label="t('widgets.kpis.vms')"
          :value="vms.value"
          :suffix="vms.suffix"
          :note="vms.note"
          :note-state="vms.noteState"
        />
        <KpiTile
          v-if="temp"
          :icon="Thermometer"
          :label="t('widgets.kpis.temp')"
          :value="temp.value"
          :suffix="temp.suffix"
          :state="temp.hot ? 'warning' : 'ok'"
          :note="temp.note"
          data-kpi="temp"
        />
        <KpiTile
          :icon="Zap"
          :label="t('widgets.kpis.power')"
          :value="power.value"
          :suffix="power.suffix"
          :progress="power.progress"
          data-kpi="power"
        />
      </div>
    </WidgetStatus>
  </section>
</template>
