<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { RailItem } from './types';

defineProps<{ item: RailItem; active: boolean }>();

const { t } = useI18n();
</script>

<template>
  <router-link
    :to="item.to"
    :aria-current="active ? 'page' : undefined"
    :class="[
      'rail-item flex h-11 flex-none items-center gap-3.5 rounded-md px-3 font-medium transition-colors duration-[120ms]',
      active
        ? 'bg-surface-raised text-text-strong shadow-[inset_2px_0_0_0_rgb(var(--c-primary-hover))]'
        : 'text-text-muted hover:bg-surface-raised hover:text-text-strong',
    ]"
  >
    <span class="relative flex">
      <component :is="item.icon" class="h-5 w-5" :stroke-width="1.75" aria-hidden="true" />
      <span
        v-if="item.critical"
        class="absolute -right-1 -top-[3px] h-2 w-2 rounded-full border-2 border-page bg-danger shadow-[0_0_8px_1px_rgb(var(--c-danger)/0.8)]"
        data-part="critical-dot"
      />
    </span>
    <span class="rail-label">{{ item.label }}</span>
    <span
      v-if="item.critical"
      class="rail-label ml-auto rounded-full bg-danger-solid px-2 font-mono text-[10px] leading-4 tracking-[0.06em] text-on-primary"
      :aria-label="t('pulse.rail.critical_aria', item.critical)"
      >{{ t('pulse.rail.crit', { count: item.critical }) }}</span
    >
    <span
      v-else-if="item.count !== null && item.count !== undefined"
      class="rail-label ml-auto font-mono text-overline text-text-muted tnum"
      >{{ item.count }}</span
    >
  </router-link>
</template>
