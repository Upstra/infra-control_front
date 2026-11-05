<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { Bell } from 'lucide-vue-next';
import AlertListItem from './AlertListItem.vue';
import { useAlertsStore } from '../../store';
import { activeCount } from '../../domain/alerts';
import { useAuthStore } from '@/features/auth/store';

const { t } = useI18n();
const store = useAlertsStore();
const auth = useAuthStore();
const open = ref(false);
const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);
const root = ref<HTMLElement | null>(null);

const count = computed(() => activeCount(store.summary));
const hasCritical = computed(() => (store.summary?.open.critical ?? 0) > 0);
const ariaLabel = computed(() => t('alerts.bell.aria', count.value));

onClickOutside(root, () => (open.value = false));
onKeyStroke('Escape', () => (open.value = false));
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      aria-haspopup="true"
      class="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-text-muted transition-colors duration-[120ms] hover:border-border-strong hover:text-text-strong"
      @click="open = !open"
    >
      <Bell class="h-[18px] w-[18px]" aria-hidden="true" />
      <span
        v-if="count"
        :class="[
          'absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-[5px] text-center font-mono text-[10px] leading-[18px] tnum',
          hasCritical
            ? 'bg-danger-solid text-on-primary'
            : 'bg-warning text-page',
        ]"
        data-part="count"
        >{{ count }}</span
      >
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
      data-part="popover"
    >
      <header class="flex items-center border-b border-border px-4 py-3">
        <span class="text-card-title text-text-strong">{{
          t('alerts.bell.title')
        }}</span>
      </header>
      <div class="flex-1 overflow-y-auto p-1.5">
        <AlertListItem
          v-for="alert in store.open"
          :key="alert.id"
          :alert="alert"
          @navigate="open = false"
        />
        <p
          v-if="!store.open.length"
          class="px-3 py-6 text-center text-text-muted"
        >
          {{ t('alerts.bell.empty') }}
        </p>
      </div>
      <router-link
        v-if="isAdmin"
        to="/admin/history"
        class="border-t border-border px-4 py-3 text-body font-medium text-primary-text hover:bg-surface-raised"
        @click="open = false"
      >
        {{ t('alerts.bell.history') }}
      </router-link>
    </div>
  </div>
</template>
