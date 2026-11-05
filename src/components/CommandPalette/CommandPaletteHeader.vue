<template>
  <div
    class="flex items-center gap-4 p-6 border-b border-border"
  >
    <div
      class="flex items-center flex-1 gap-3 px-4 py-3 bg-surface-sunken rounded-xl border border-border focus-within:border-primary dark:focus-within:border-blue-400 focus-within:bg-surface dark:focus-within:bg-neutral-600 transition-all"
    >
      <SearchIcon class="w-5 h-5 text-text-muted flex-shrink-0" />
      <input
        ref="searchInput"
        :value="query"
        type="text"
        :placeholder="t('command_palette.placeholder')"
        class="flex-1 bg-transparent border-0 outline-none text-text-strong placeholder:text-text-faint"
        @input="
          $emit(
            'update:query',
            ($event.target as HTMLInputElement)?.value || '',
          )
        "
        @keydown="$emit('keydown', $event)"
      />
    </div>
    <div class="flex items-center gap-2">
      <kbd
        class="px-2 py-1 text-xs font-medium text-text-muted bg-surface-raised border border-border rounded-md"
      >
        ⌘K
      </kbd>
      <button
        @click="$emit('close')"
        class="p-2 text-text-muted hover:text-text hover:bg-surface-raised rounded-lg transition-colors"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search as SearchIcon } from 'lucide-vue-next';
import { XMarkIcon } from '@heroicons/vue/24/outline';

interface Props {
  query: string;
}

defineProps<Props>();

defineEmits<{
  'update:query': [value: string];
  keydown: [event: KeyboardEvent];
  close: [];
}>();

const { t } = useI18n();
const searchInput = ref<HTMLInputElement>();

defineExpose({
  searchInput,
});
</script>
