<template>
  <div class="flex items-center justify-between">
    <div class="text-sm text-text">
      {{ $t('pagination.page') }} {{ currentPage }} {{ $t('pagination.of') }}
      {{ totalPages }}
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 border border-border-control rounded-md text-sm hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.previous') }}
      </button>

      <div class="flex gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('page-change', page)"
          class="px-3 py-1 text-sm rounded-md"
          :class="[
            page === currentPage
              ? 'bg-primary text-white'
              : 'text-text hover:bg-surface-raised',
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 border border-border-control rounded-md text-sm hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits<{
  'page-change': [page: number];
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;

  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>
