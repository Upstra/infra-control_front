<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/20 backdrop-blur-sm"
        @click="closeCommandPalette"
      >
        <div
          class="w-full max-w-2xl mt-24 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden"
          @click.stop
        >
          <CommandPaletteHeader
            ref="headerRef"
            v-model:query="query"
            @keydown="handleKeydown"
            @close="closeCommandPalette"
          />

          <CommandPaletteResults
            :grouped-actions="groupedActions"
            :selected-index="selectedIndex"
            @action="handleAction"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import CommandPaletteHeader from './CommandPalette/CommandPaletteHeader.vue';
import CommandPaletteResults from './CommandPalette/CommandPaletteResults.vue';
import { useCommandPalette } from './CommandPalette/useCommandPalette';

const headerRef = ref();

const {
  isOpen,
  query,
  selectedIndex,
  groupedActions,
  openCommandPalette,
  closeCommandPalette,
  handleAction,
  handleKeydown,
} = useCommandPalette();

const openCommandPaletteWithFocus = () => {
  openCommandPalette();
  nextTick(() => {
    headerRef.value?.searchInput?.focus();
  });
};

defineExpose({
  openCommandPalette: openCommandPaletteWithFocus,
  closeCommandPalette,
});
</script>
