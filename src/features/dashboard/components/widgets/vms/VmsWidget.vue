<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SegmentedControl } from '@/shared/components/pulse';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import VmTableRow from './VmTableRow.vue';
import { dataState } from '../shared/dataState';
import { useVmwareLiveStore } from '@/features/vmware/liveStore';
import { isIssue, sortVmsBySeverity } from '@/features/vms/domain/presentation';

type Filter = 'issues' | 'all';

const { t } = useI18n();
const live = useVmwareLiveStore();
const filter = ref<Filter>('issues');

onMounted(() => live.start());

const options = computed(() => [
  { value: 'issues' as const, label: t('widgets.vms.issues') },
  { value: 'all' as const, label: t('widgets.vms.all') },
]);

const sorted = computed(() => sortVmsBySeverity(live.vms));
const issues = computed(() => sorted.value.filter(isIssue));
const rows = computed(() =>
  filter.value === 'issues' ? issues.value : sorted.value,
);
const state = computed(() => dataState(live, rows.value.length === 0));
const hostName = (moid?: string) =>
  (moid && live.hostsByMoid[moid]?.name) || null;
const columns = computed(() => [
  t('widgets.vms.col_vm'),
  t('widgets.vms.col_state'),
  t('widgets.vms.col_host'),
  t('widgets.vms.col_cpu'),
  t('widgets.vms.col_uptime'),
]);
</script>

<template>
  <WidgetCard
    :title="t('widgets.types.vms.label')"
    :meta="
      t('widgets.vms.count', { issues: issues.length, total: sorted.length })
    "
    flush
  >
    <template #actions>
      <SegmentedControl
        v-model="filter"
        :options="options"
        :label="t('widgets.vms.filter')"
      />
    </template>
    <div class="px-6 pb-4" v-if="state !== 'ready'">
      <WidgetStatus
        :state="state"
        :empty-text="t('widgets.vms.none_issues')"
        @retry="live.load"
      />
    </div>
    <div v-else class="overflow-x-auto">
      <div class="min-w-[640px]">
        <div
          class="grid grid-cols-[3fr_2fr_1.5fr_3fr_1.5fr] gap-4 border-t border-border px-6 py-3 font-mono text-overline text-text-muted"
        >
          <span
            v-for="(column, index) in columns"
            :key="column"
            :class="index === columns.length - 1 ? 'text-right' : ''"
            >{{ column }}</span
          >
        </div>
        <VmTableRow
          v-for="vm in rows"
          :key="vm.moid ?? vm.id"
          :vm="vm"
          :host-name="hostName(vm.esxiHostMoid)"
        />
      </div>
    </div>
  </WidgetCard>
</template>
