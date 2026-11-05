<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MetricRing, StatusPill } from '@/shared/components/pulse';
import type { Emphasis, UpsCardModel } from '../../../domain/upsCard';

const props = defineProps<{ card: UpsCardModel }>();

const { t } = useI18n();

const emphasisClass: Record<Emphasis, string> = {
  normal: 'text-text-strong',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
};

const pillLabel = computed(() => {
  const base = t(`widgets.ups.pill.${props.card.condition}`);
  return props.card.condition === 'nominal'
    ? `${t('widgets.ups.pill.online')} · ${base}`
    : base;
});

const readings = computed(() => [
  { key: 'load', label: t('widgets.ups.load'), ...props.card.load },
  { key: 'runtime', label: t('widgets.ups.runtime'), ...props.card.runtime },
  { key: 'temp', label: t('widgets.ups.temp'), ...props.card.temperature },
  { key: 'input', label: t('widgets.ups.input'), ...props.card.input },
]);
</script>

<template>
  <router-link
    :to="`/ups/${card.id}`"
    :class="[
      'flex flex-col gap-5 rounded-lg border bg-surface p-6 transition-colors duration-[120ms]',
      card.condition === 'on_battery'
        ? 'border-danger-border shadow-glow-danger'
        : 'border-border hover:border-border-strong',
    ]"
    :data-condition="card.condition"
  >
    <div class="flex items-center gap-3.5">
      <MetricRing
        :value="card.battery"
        :size="64"
        :caption="t('pulse.ring.battery')"
      />
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-card-title text-text-strong">{{
          card.name
        }}</span>
        <span class="truncate text-caption text-text-muted">{{
          card.model ?? t('pulse.empty')
        }}</span>
      </div>
    </div>
    <StatusPill
      class="self-start"
      :state="card.health"
      :label="pillLabel"
      :detail="card.pillDetail"
    />
    <dl class="m-0 grid grid-cols-2 gap-x-4 gap-y-3 font-mono tnum">
      <div v-for="reading in readings" :key="reading.key">
        <dt class="text-overline text-text-muted">{{ reading.label }}</dt>
        <dd :class="['m-0 whitespace-nowrap', emphasisClass[reading.emphasis]]">
          {{ reading.text }}
        </dd>
      </div>
    </dl>
  </router-link>
</template>
