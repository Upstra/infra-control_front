<template>
  <div
    class="min-h-screen bg-gradient-to-br via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-surface/80 backdrop-blur-lg border border-border shadow-xl rounded-2xl p-8 md:p-10"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
