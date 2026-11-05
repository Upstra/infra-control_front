<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Plus, Check } from 'lucide-vue-next';

defineProps<{ name: string; canDelete: boolean; saving: boolean }>();

const emit = defineEmits<{
  rename: [name: string];
  add: [];
  delete: [];
  cancel: [];
  save: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="edit-bar flex flex-wrap items-center gap-3 rounded-lg border border-primary-dark py-3.5 pl-5 pr-4"
  >
    <span class="font-mono text-overline text-primary-text">{{
      t('boards.edit_mode')
    }}</span>
    <label
      class="flex h-9 items-center gap-2 rounded-md border border-border-control bg-surface-sunken px-3 focus-within:border-primary-hover"
    >
      <span class="text-caption text-text-muted">{{ t('boards.name') }}</span>
      <input
        type="text"
        :value="name"
        :aria-label="t('boards.name_aria')"
        class="w-44 border-0 bg-transparent font-medium text-text-strong outline-none"
        @input="emit('rename', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <span class="text-caption text-text-muted">{{ t('boards.hint') }}</span>
    <div class="flex-1" />
    <button
      type="button"
      class="pulse-press inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 font-medium text-on-primary hover:bg-primary-hover"
      @click="emit('add')"
    >
      <Plus class="h-4 w-4" aria-hidden="true" />{{ t('boards.add_widget') }}
    </button>
    <button
      v-if="canDelete"
      type="button"
      class="pulse-press h-9 rounded-md px-3 font-medium text-danger-text hover:bg-danger-surface"
      @click="emit('delete')"
    >
      {{ t('boards.delete') }}
    </button>
    <button
      type="button"
      class="pulse-press h-9 rounded-md border border-border-strong px-3.5 font-medium text-text hover:bg-surface-raised"
      @click="emit('cancel')"
    >
      {{ t('boards.cancel') }}
    </button>
    <button
      type="button"
      :disabled="saving"
      class="pulse-press inline-flex h-9 items-center gap-2 rounded-md bg-text-strong px-3.5 font-medium text-page disabled:opacity-60"
      @click="emit('save')"
    >
      <Check class="h-4 w-4" aria-hidden="true" />{{ t('boards.save') }}
    </button>
  </div>
</template>

<style scoped>
.edit-bar {
  background: radial-gradient(
    ellipse at left,
    rgb(var(--c-primary-hover) / 0.12),
    rgb(var(--c-surface)) 60%
  );
  box-shadow: 0 0 40px -12px rgb(var(--c-primary-hover) / 0.45);
}
</style>
