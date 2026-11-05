<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ServerVmRow from './ServerVmRow.vue';
import { useArmedAction } from '../../../composables/useArmedAction';
import type { VmAction } from '../../../composables/useServerVms';
import type { Server } from '../../../types';
import type { Vm } from '@/features/vms/types';

defineProps<{
  server: Server;
  vms: Vm[];
  busy: Record<string, VmAction>;
}>();
const emit = defineEmits<{ act: [vm: Vm, action: VmAction] }>();

const { t } = useI18n();
const { armed, trigger } = useArmedAction();

const columns = computed(() =>
  ['col_vm', 'col_state', 'col_cpu', 'col_uptime', 'col_actions'].map((key) =>
    t(`serversPage.vms.${key}`),
  ),
);
const stop = (vm: Vm) => trigger(vm.id, () => emit('act', vm, 'stop'));
</script>

<template>
  <p v-if="server.type === 'vcenter'" class="m-0 text-text-muted">
    {{ t('serversPage.vms.vcenter', { name: server.name }) }}
  </p>
  <div v-else class="overflow-x-auto rounded-[12px] border border-border">
    <div class="min-w-[620px]">
      <div
        class="grid grid-cols-[2.5fr_2fr_1fr_1fr_2fr] gap-4 px-4 py-2.5 font-mono text-overline text-text-muted"
      >
        <span
          v-for="(column, index) in columns"
          :key="column"
          :class="index === columns.length - 1 ? 'text-right' : ''"
          >{{ column }}</span
        >
      </div>
      <ServerVmRow
        v-for="vm in vms"
        :key="vm.id"
        :vm="vm"
        :busy="busy[vm.id] ?? null"
        :armed="armed === vm.id"
        @start="emit('act', vm, 'start')"
        @restart="emit('act', vm, 'restart')"
        @stop="stop(vm)"
      />
      <p
        v-if="!vms.length"
        class="m-0 border-t border-surface-raised px-4 py-6 text-center text-text-muted"
      >
        {{ t('serversPage.vms.empty') }}
      </p>
    </div>
  </div>
</template>
