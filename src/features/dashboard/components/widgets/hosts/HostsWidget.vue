<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WidgetCard from '../shared/WidgetCard.vue';
import WidgetStatus from '../shared/WidgetStatus.vue';
import HostTile from './HostTile.vue';
import { dataState } from '../shared/dataState';
import { useVmwareLiveStore } from '@/features/vmware/liveStore';
import { useUpsLiveStore } from '@/features/ups/liveStore';

const { t } = useI18n();
const live = useVmwareLiveStore();
const upsLive = useUpsLiveStore();

onMounted(() => {
  live.start();
  upsLive.start();
});

const hosts = computed(() =>
  [...live.hosts].sort((a, b) => a.name.localeCompare(b.name)),
);
const onBattery = (upsId: string | null) =>
  !!upsId && upsLive.statusById[upsId]?.onBattery === true;
const onBatteryCount = computed(
  () => hosts.value.filter((host) => onBattery(host.upsId)).length,
);
const state = computed(() => dataState(live, hosts.value.length === 0));
</script>

<template>
  <WidgetCard :title="t('widgets.types.hosts.label')">
    <WidgetStatus
      :state="state"
      :stale="live.stale"
      :empty-text="t('widgets.hosts.empty')"
      @retry="live.load"
    >
      <div class="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
        <HostTile
          v-for="host in hosts"
          :key="host.moid"
          :host="host"
          :on-battery="onBattery(host.upsId)"
        />
      </div>
      <span class="text-caption text-text-muted">{{
        onBatteryCount
          ? t('widgets.hosts.on_battery', onBatteryCount)
          : t('widgets.hosts.nominal')
      }}</span>
    </WidgetStatus>
  </WidgetCard>
</template>
