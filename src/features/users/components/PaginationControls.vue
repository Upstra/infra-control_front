<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  currentPage: number
  totalItems: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const maxPage = computed(() => Math.ceil(props.totalItems / props.pageSize))
</script>

<template>
  <div class="mt-6 flex justify-center gap-3">
    <button
      @click="emit('update:page', props.currentPage - 1)"
      :disabled="props.currentPage === 1"
      class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <span class="self-center font-semibold">
      Page
      <input
        :value="props.currentPage"
        @input="event => {
            const target = event.target as HTMLInputElement | null
            if (target) {
                emit('update:page', Math.min(Math.max(1, +target.value), maxPage))
            }
        }"
        type="number"
        min="1"
        :max="maxPage"
        class="w-16 text-center border rounded px-2 py-1 mx-2"
        aria-label="Numéro de page"
      />
      sur {{ maxPage }}
    </span>

    <button
      @click="emit('update:page', props.currentPage + 1)"
      :disabled="props.currentPage >= maxPage"
      class="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>