<template>
  <div class="flex items-center gap-4 p-6 border-b border-neutral-100">
    <div
      class="flex items-center flex-1 gap-3 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus-within:border-primary focus-within:bg-white transition-all"
    >
      <SearchIcon class="w-5 h-5 text-neutral-400 flex-shrink-0" />
      <input
        ref="searchInput"
        :value="query"
        type="text"
        :placeholder="t('command_palette.placeholder')"
        class="flex-1 bg-transparent border-0 outline-none text-neutral-800 placeholder-neutral-400"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
        @keydown="$emit('keydown', $event)"
      />
    </div>
    <div class="flex items-center gap-2">
      <kbd
        class="px-2 py-1 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-md"
      >
        ⌘K
      </kbd>
      <button
        @click="$emit('close')"
        class="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
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
