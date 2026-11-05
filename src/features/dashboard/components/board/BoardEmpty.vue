<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { LayoutDashboard } from 'lucide-vue-next';

const emit = defineEmits<{ add: [] }>();
const { t } = useI18n();
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-strong px-6 py-[72px] text-center"
  >
    <div
      class="grid h-14 w-14 place-items-center rounded-lg border border-border bg-surface-raised text-primary-text"
    >
      <LayoutDashboard class="h-6 w-6" aria-hidden="true" />
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-card-title text-text-strong">{{
        t('boards.empty_title')
      }}</span>
      <span class="text-text-muted">{{ t('boards.empty_text') }}</span>
    </div>
    <button
      type="button"
      class="pulse-press inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-medium text-on-primary hover:bg-primary-hover"
      @click="emit('add')"
    >
      {{ t('boards.add_widget') }}
    </button>
  </div>
</template>
