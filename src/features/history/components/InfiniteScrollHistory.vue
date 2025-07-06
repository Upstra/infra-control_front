<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { HistoryEvent } from '../types';

const props = defineProps<{
  events: HistoryEvent[];
  loading: boolean;
  hasMore: boolean;
}>();

const emit = defineEmits<{
  loadMore: [];
}>();

const scrollContainer = ref<HTMLElement>();
const isLoadingMore = ref(false);

const handleScroll = () => {
  if (
    !scrollContainer.value ||
    props.loading ||
    !props.hasMore ||
    isLoadingMore.value
  )
    return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

  if (scrollPercentage > 0.8) {
    isLoadingMore.value = true;
    emit('loadMore');
    setTimeout(() => {
      isLoadingMore.value = false;
    }, 500);
  }
};

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll);
});

const groupedEvents = computed(() => {
  const groups: Record<string, HistoryEvent[]> = {};

  props.events.forEach((event) => {
    const eventDate = new Date(event.createdAt);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  });

  return Object.entries(groups).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
  );
});
</script>

<template>
  <div ref="scrollContainer" class="history-scroll-container">
    <div v-for="[date, dayEvents] in groupedEvents" :key="date" class="mb-8">
      <div
        class="sticky top-0 bg-gray-50 dark:bg-neutral-900 z-10 py-2 px-4 -mx-4 mb-4"
      >
        <h3
          class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
        >
          {{
            new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}
        </h3>
      </div>

      <div class="space-y-3">
        <slot v-for="event in dayEvents" :key="event.id" :event="event" />
      </div>
    </div>

    <div v-if="props.loading || isLoadingMore" class="flex justify-center py-8">
      <div class="flex items-center gap-3">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <span class="text-gray-600 dark:text-gray-400"
          >Loading more events...</span
        >
      </div>
    </div>

    <div
      v-else-if="!props.hasMore && props.events.length > 0"
      class="text-center py-8"
    >
      <div
        class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>You've reached the end</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-scroll-container {
  @apply h-[calc(100vh-300px)] overflow-y-auto relative px-4;
  scrollbar-width: thin;
  scrollbar-color: theme('colors.gray.300') transparent;
}

.history-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.history-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.history-scroll-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-neutral-600 rounded-full;
}

.history-scroll-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-neutral-500;
}
</style>
