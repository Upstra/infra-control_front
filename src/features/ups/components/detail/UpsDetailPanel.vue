<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import UpsDetailHeader from './UpsDetailHeader.vue';
import DetailTabs from './DetailTabs.vue';
import UpsOverviewTab from './overview/UpsOverviewTab.vue';
import UpsServersTab from './servers/UpsServersTab.vue';
import UpsSettingsTab from './settings/UpsSettingsTab.vue';
import { useUpsServers } from '../../composables/useUpsServers';
import { useUpsPing } from '../../composables/useUpsPing';
import type { UpsRowModel } from '../../domain/row';
import type { BatteryStatus, UpsResponseDto } from '../../types';
import type { RoomResponseDto } from '@/features/rooms/types';

type Tab = 'overview' | 'servers' | 'settings';

const props = defineProps<{
  ups: UpsResponseDto;
  row: UpsRowModel;
  status: BatteryStatus | null;
  rooms: RoomResponseDto[];
  roomName: (id: string) => string | null;
}>();

const emit = defineEmits<{ deleted: [] }>();

const { t } = useI18n();
const tab = ref<Tab>('overview');
const { servers, reload } = useUpsServers(computed(() => props.ups.id));
const { ping, pinging } = useUpsPing();

watch(
  () => props.ups.roomId,
  () => reload(),
);

const tabs = computed(() => [
  { value: 'overview' as const, label: t('upsPage.detail.overview') },
  {
    value: 'servers' as const,
    label: t('upsPage.detail.servers'),
    count: servers.value.length,
  },
  { value: 'settings' as const, label: t('upsPage.detail.settings') },
]);
const onBattery = computed(() => props.row.condition === 'on_battery');
const upsRef = toRef(props, 'ups');
</script>

<template>
  <section
    :aria-label="ups.name"
    :class="[
      'flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-lg border bg-surface shadow-sm',
      onBattery ? 'border-danger-border shadow-glow-danger' : 'border-border',
    ]"
  >
    <UpsDetailHeader
      :row="row"
      :room-name="roomName(ups.roomId)"
      :pinging="pinging"
      @ping="ping(upsRef)"
    />
    <DetailTabs v-model="tab" :tabs="tabs" :label="t('upsPage.detail.tabs')" />
    <div :key="tab" class="pulse-swap flex flex-col gap-6 p-6">
      <UpsOverviewTab
        v-if="tab === 'overview'"
        :ups="ups"
        :status="status"
        :condition="row.condition"
      />
      <UpsServersTab
        v-else-if="tab === 'servers'"
        :ups="ups"
        :servers="servers"
        :on-battery="onBattery"
      />
      <UpsSettingsTab
        v-else
        :ups="ups"
        :servers="servers"
        :rooms="rooms"
        :room-name="roomName"
        @deleted="emit('deleted')"
      />
    </div>
  </section>
</template>
