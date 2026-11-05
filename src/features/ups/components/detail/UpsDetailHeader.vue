<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Activity, LoaderCircle } from 'lucide-vue-next';
import { StatusPill } from '@/shared/components/pulse';
import { fmt } from '@/shared/utils/fmt';
import type { UpsRowModel } from '../../domain/row';

const props = defineProps<{
  row: UpsRowModel;
  roomName: string | null;
  pinging: boolean;
}>();
const emit = defineEmits<{ ping: [] }>();

const { t } = useI18n();
const detail = computed(() =>
  props.row.condition === 'on_battery'
    ? fmt.minutes(props.row.minutesRemaining)
    : null,
);
</script>

<template>
  <div class="flex flex-wrap items-start gap-4 px-6 pt-6">
    <div class="flex min-w-0 flex-col gap-1.5">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="m-0 text-title text-text-strong">{{ row.name }}</h2>
        <StatusPill
          :state="row.health"
          :label="t(`upsPage.pill.${row.condition}`)"
          :detail="detail"
        />
      </div>
      <span class="font-mono text-caption text-text-muted tnum">{{
        t('upsPage.detail.sub', {
          ip: row.ip,
          room: roomName ?? t('pulse.empty'),
        })
      }}</span>
    </div>
    <div class="flex-1" />
    <button
      type="button"
      class="pulse-btn-ghost h-9"
      :disabled="pinging"
      @click="emit('ping')"
    >
      <LoaderCircle
        v-if="pinging"
        class="pulse-spin h-3.5 w-3.5"
        aria-hidden="true"
      />
      <Activity v-else class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t('upsPage.detail.ping') }}
    </button>
  </div>
</template>
