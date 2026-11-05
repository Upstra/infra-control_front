<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Menu, X, Activity } from 'lucide-vue-next';
import { isRailItemActive } from '@/shared/components/pulse/rail/isActive';
import type { RailItem } from '@/shared/components/pulse';

defineProps<{ items: RailItem[] }>();

const { t } = useI18n();
const route = useRoute();
const open = ref(false);

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);
</script>

<template>
  <div class="min-[760px]:hidden">
    <div
      class="flex h-14 items-center gap-3 border-b border-border bg-page px-4"
    >
      <span
        class="grid h-8 w-8 place-items-center rounded-md bg-primary shadow-glow-brand"
      >
        <Activity class="h-4 w-4 text-on-primary" aria-hidden="true" />
      </span>
      <span class="font-semibold text-text-strong">Upstra</span>
      <button
        type="button"
        class="ml-auto grid h-10 w-10 place-items-center rounded-md text-text-muted hover:bg-surface-raised"
        :aria-label="t('pulse.rail.menu')"
        :aria-expanded="open"
        @click="open = !open"
      >
        <X v-if="open" class="h-5 w-5" aria-hidden="true" />
        <Menu v-else class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <nav
      v-if="open"
      :aria-label="t('pulse.rail.label')"
      class="flex flex-col gap-1 border-b border-border bg-surface p-3"
    >
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :aria-current="isRailItemActive(item, route.path) ? 'page' : undefined"
        class="flex h-11 items-center gap-3 rounded-md px-3 text-text-muted hover:bg-surface-raised hover:text-text-strong aria-[current=page]:bg-surface-raised aria-[current=page]:text-text-strong"
      >
        <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.critical"
          class="ml-auto rounded-full bg-danger-solid px-2 font-mono text-[10px] leading-4 text-on-primary"
          >{{ t('pulse.rail.crit', { count: item.critical }) }}</span
        >
      </router-link>
    </nav>
  </div>
</template>
