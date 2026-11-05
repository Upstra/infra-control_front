<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Search } from 'lucide-vue-next';
import UserDropdown from '@/layouts/components/UserDropdown.vue';
import { useCommandPalette } from '@/components/CommandPalette/useCommandPalette';

const { t } = useI18n();
const { openCommandPalette } = useCommandPalette();
</script>

<template>
  <div class="flex items-center gap-4 px-10 py-4 max-[759px]:px-4">
    <button
      type="button"
      class="group flex h-10 w-full max-w-md items-center gap-3 rounded-full border border-border bg-surface px-4 text-left transition-colors duration-[120ms] hover:border-border-strong"
      @click="openCommandPalette"
    >
      <Search class="h-4 w-4 text-text-muted" aria-hidden="true" />
      <span class="flex-1 text-body text-text-muted">
        {{ t('command_palette.search_placeholder') }}
      </span>
      <kbd
        class="hidden items-center gap-1 rounded-sm border border-border bg-surface-raised px-2 py-0.5 font-mono text-overline text-text-muted sm:flex"
        >⌘K</kbd
      >
    </button>
    <div class="ml-auto flex items-center gap-3">
      <slot name="actions" />
      <UserDropdown />
    </div>
  </div>
</template>
