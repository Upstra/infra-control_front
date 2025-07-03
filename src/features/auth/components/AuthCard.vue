<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4 py-8"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white/80 dark:bg-neutral-800/90 backdrop-blur-lg border border-white/20 dark:border-neutral-700/50 shadow-xl rounded-2xl p-8 md:p-10"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth card wrapper component for consistent layout
</script>
