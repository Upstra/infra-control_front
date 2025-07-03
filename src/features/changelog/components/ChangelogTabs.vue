<script setup lang="ts">
const props = defineProps<{ tab: 'frontend' | 'backend' }>();
const emit = defineEmits<{
  (e: 'update:tab', value: 'frontend' | 'backend'): void;
}>();
</script>

<template>
  <div class="flex gap-2 mb-4">
    <button
      class="px-4 py-2 rounded-2xl font-semibold transition shadow-sm border"
      :class="
        props.tab === 'frontend'
          ? 'bg-primary text-white border-primary'
          : 'bg-neutral-light dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-dark dark:text-neutral-300 hover:bg-primary/10 dark:hover:bg-primary/20'
      "
      @click="emit('update:tab', 'frontend')"
    >
      Frontend
    </button>
    <button
      class="px-4 py-2 rounded-2xl font-semibold transition shadow-sm border"
      :class="
        props.tab === 'backend'
          ? 'bg-primary text-white border-primary'
          : 'bg-neutral-light dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-dark dark:text-neutral-300 hover:bg-primary/10 dark:hover:bg-primary/20'
      "
      @click="emit('update:tab', 'backend')"
    >
      Backend
    </button>
  </div>
</template>
