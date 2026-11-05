<script setup lang="ts">
import ServerCallouts from './ServerCallouts.vue';
import ServerReadings from './ServerReadings.vue';
import ServerCpuChart from './ServerCpuChart.vue';
import ServerLinks from './ServerLinks.vue';
import type { ServerRowModel } from '../../../domain/row';
import type { Vm } from '@/features/vms/types';

defineProps<{
  row: ServerRowModel;
  vms: Vm[];
  vmsOn: number;
  iloUnreachable: boolean;
  inletWarnC: number | null | undefined;
  groupName: string | null;
}>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <ServerCallouts
      :row="row"
      :vms="vms"
      :ilo-unreachable="iloUnreachable"
      :inlet-warn-c="inletWarnC"
    />
    <ServerReadings
      :row="row"
      :vms-on="vmsOn"
      :vms-total="vms.length"
      :ilo-unreachable="iloUnreachable"
      :inlet-warn-c="inletWarnC"
    />
    <ServerCpuChart
      v-if="row.host"
      :moid="row.host.moid"
      :name="row.server.name"
    />
    <ServerLinks
      :row="row"
      :inlet-warn-c="inletWarnC"
      :group-name="groupName"
    />
  </div>
</template>
