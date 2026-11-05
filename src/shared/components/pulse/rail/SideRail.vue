<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Activity } from 'lucide-vue-next';
import SideRailItem from './SideRailItem.vue';
import { isRailItemActive } from './isActive';
import type { RailItem, RailSection, RailUser } from './types';

const props = defineProps<{
  items: RailItem[];
  user: RailUser | null;
  environment?: string | null;
}>();

const { t } = useI18n();
const route = useRoute();

const bySection = (section: RailSection) =>
  props.items.filter((item) => item.section === section);

const operate = computed(() => bySection('operate'));
const consult = computed(() => bySection('consult'));
const settings = computed(() => bySection('settings'));
const initials = computed(() =>
  (props.user?.name ?? '').slice(0, 2).toUpperCase(),
);
const active = (item: RailItem) => isRailItemActive(item, route.path);
</script>

<template>
  <div class="rail-wrap relative z-30 flex-[0_0_76px] max-[759px]:hidden">
    <nav class="rail" :aria-label="t('pulse.rail.label')">
      <router-link
        to="/dashboard"
        class="mb-4 flex h-11 flex-none items-center gap-3.5 pl-0.5"
      >
        <span
          class="grid h-10 w-10 flex-none place-items-center rounded-md bg-primary shadow-glow-brand"
        >
          <Activity class="h-5 w-5 text-on-primary" aria-hidden="true" />
        </span>
        <span class="rail-label flex flex-col">
          <span class="font-semibold text-text-strong">Upstra</span>
          <span
            v-if="environment"
            class="font-mono text-[11px] leading-[14px] tracking-[0.06em] text-text-muted"
            >{{ environment }}</span
          >
        </span>
      </router-link>
      <SideRailItem
        v-for="item in operate"
        :key="item.to"
        :item="item"
        :active="active(item)"
      />
      <div class="mx-1 my-2.5 h-px flex-none bg-surface-raised" />
      <SideRailItem
        v-for="item in consult"
        :key="item.to"
        :item="item"
        :active="active(item)"
      />
      <div class="flex-1" />
      <SideRailItem
        v-for="item in settings"
        :key="item.to"
        :item="item"
        :active="active(item)"
      />
      <router-link
        v-if="user"
        :to="user.to"
        class="rail-item flex h-11 flex-none items-center gap-3.5 rounded-md px-1 hover:bg-surface-raised"
      >
        <span
          class="grid h-9 w-9 flex-none place-items-center rounded-full border border-border-strong bg-surface-raised text-caption text-text-strong"
          aria-hidden="true"
          >{{ initials }}</span
        >
        <span class="rail-label flex flex-col">
          <span class="text-text-strong">{{ user.name }}</span>
          <span class="text-caption text-text-muted">{{ user.role }}</span>
        </span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.rail {
  position: absolute;
  inset: 0 auto 0 0;
  width: 76px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 16px;
  background: rgb(var(--c-page));
  border-right: 1px solid rgb(var(--c-surface-raised));
  overflow: hidden;
  transition:
    width 0.18s var(--ease-pulse),
    background 0.18s,
    box-shadow 0.18s;
}

.rail:hover,
.rail:focus-within {
  width: 248px;
  background: rgb(var(--c-surface));
  border-right-color: rgb(var(--c-border));
  box-shadow: 24px 0 48px -16px rgb(0 0 0 / 0.75);
  transition:
    width 0.24s var(--ease-pulse) 0.1s,
    background 0.18s 0.1s,
    box-shadow 0.18s 0.1s;
}

.rail :deep(.rail-label) {
  opacity: 0;
  transform: translateX(-6px);
  white-space: nowrap;
  transition:
    opacity 0.12s,
    transform 0.12s;
}

.rail:hover :deep(.rail-label),
.rail:focus-within :deep(.rail-label) {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.18s 0.16s,
    transform 0.18s 0.16s;
}

.rail :deep(.rail-item:focus-visible) {
  outline-offset: -2px;
}
</style>
