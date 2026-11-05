<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TabBar } from '@/shared/components/pulse';
import ServerDetailHeader from './ServerDetailHeader.vue';
import PowerConfirm from './PowerConfirm.vue';
import ServerSshDrawer from './ServerSshDrawer.vue';
import ServerOverviewTab from './overview/ServerOverviewTab.vue';
import ServerVmsTab from './vms/ServerVmsTab.vue';
import ServerHardwareTab from './hardware/ServerHardwareTab.vue';
import ServerHistoryTab from './history/ServerHistoryTab.vue';
import ServerSettingsTab from './settings/ServerSettingsTab.vue';
import { useServerVms } from '../../composables/useServerVms';
import { useServerPower } from '../../composables/useServerPower';
import { useServerPing } from '../../composables/useServerPing';
import { useAlertsStore } from '@/features/alerts/store';
import { useGroupName } from '../../composables/useGroupName';
import type { ServerRowModel } from '../../domain/row';
import type { RoomResponseDto } from '@/features/rooms/types';

type Tab = 'overview' | 'vms' | 'hardware' | 'history' | 'settings';

const props = defineProps<{
  row: ServerRowModel;
  rooms: RoomResponseDto[];
  inletWarnC: number | null | undefined;
}>();
const emit = defineEmits<{ removed: [] }>();

const { t } = useI18n();
const alerts = useAlertsStore();
const tab = ref<Tab>('overview');
const sshOpen = ref(false);
const server = computed(() => props.row.server);
const { vms, running, busy, act } = useServerVms(() => server.value.id);
const power = useServerPower(() => server.value, running);
const { ping, pinging } = useServerPing();
const groupName = useGroupName(() => server.value.groupId);

watch(
  () => server.value.id,
  () => {
    power.cancel();
    sshOpen.value = false;
  },
);

const iloUnreachable = computed(() =>
  alerts.open.some(
    (alert) =>
      alert.type === 'server_ilo_unreachable' &&
      alert.resourceId === server.value.id,
  ),
);
const tabs = computed(() => [
  { value: 'overview' as const, label: t('serversPage.detail.overview') },
  {
    value: 'vms' as const,
    label: t('serversPage.detail.vms'),
    count: server.value.type === 'esxi' ? vms.value.length : null,
  },
  { value: 'hardware' as const, label: t('serversPage.detail.hardware') },
  { value: 'history' as const, label: t('serversPage.detail.history') },
  { value: 'settings' as const, label: t('serversPage.detail.settings') },
]);
const critical = computed(() => props.row.health.state === 'down');
</script>

<template>
  <section
    :aria-label="server.name"
    :class="[
      'flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-lg border bg-surface shadow-sm',
      critical ? 'border-danger-border shadow-glow-danger' : 'border-border',
    ]"
  >
    <ServerDetailHeader
      :row="row"
      :pinging="pinging"
      :block="power.block.value"
      @ping="ping(server)"
      @ssh="sshOpen = true"
      @power="power.request"
    />
    <PowerConfirm
      v-if="power.pending.value"
      :confirmation="power.pending.value"
      :server-name="server.name"
      @confirm="power.run(power.pending.value.action)"
      @cancel="power.cancel"
    />
    <TabBar v-model="tab" :tabs="tabs" :label="t('serversPage.detail.tabs')" />
    <div :key="tab" class="pulse-swap flex flex-col gap-6 p-6">
      <ServerOverviewTab
        v-if="tab === 'overview'"
        :row="row"
        :vms="vms"
        :vms-on="running"
        :ilo-unreachable="iloUnreachable"
        :inlet-warn-c="inletWarnC"
        :group-name="groupName"
      />
      <ServerVmsTab
        v-else-if="tab === 'vms'"
        :server="server"
        :vms="vms"
        :busy="busy"
        @act="act"
      />
      <ServerHardwareTab
        v-else-if="tab === 'hardware'"
        :server="server"
        :ilo-unreachable="iloUnreachable"
        :inlet-warn-c="inletWarnC"
      />
      <ServerHistoryTab v-else-if="tab === 'history'" :server-id="server.id" />
      <ServerSettingsTab
        v-else
        :server="server"
        :rooms="rooms"
        :vm-count="vms.length"
        @removed="emit('removed')"
      />
    </div>
    <ServerSshDrawer
      :open="sshOpen"
      :server="server"
      @close="sshOpen = false"
    />
  </section>
</template>
