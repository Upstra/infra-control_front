<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
}>();

const emit = defineEmits<(e: 'update:page', value: number) => void>();
const maxPage = computed(() => Math.ceil(props.totalItems / props.pageSize));
const { t } = useI18n();
</script>

<template>
  <div class="mt-6 flex justify-center gap-3">
    <button
      @click="emit('update:page', props.currentPage - 1)"
      :disabled="props.currentPage === 1"
      class="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 flex items-center justify-center transition text-neutral-darker dark:text-white"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <span class="self-center font-semibold text-neutral-darker dark:text-white">
      {{ t('pagination.page') }}
      <input
        :value="props.currentPage"
        @input="
          (event) => {
            const target = event.target as HTMLInputElement | null;
            if (target) {
              emit(
                'update:page',
                Math.min(Math.max(1, +target.value), maxPage),
              );
            }
          }
        "
        type="number"
        min="1"
        :max="maxPage"
        class="w-16 text-center border border-neutral-300 dark:border-neutral-600 rounded-lg px-2 py-1 mx-2 bg-white dark:bg-neutral-800 text-neutral-darker dark:text-white"
        :aria-label="t('pagination.page')"
      />
      {{ t('pagination.of') }} {{ maxPage }}
    </span>

    <button
      @click="emit('update:page', props.currentPage + 1)"
      :disabled="props.currentPage >= maxPage"
      class="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 flex items-center justify-center transition text-neutral-darker dark:text-white"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>
