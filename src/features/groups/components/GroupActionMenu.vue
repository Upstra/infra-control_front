<template>
  <div
    ref="menuRef"
    class="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <button
      v-if="isAdmin"
      @click="handleAction('edit')"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
    >
      <PencilIcon class="w-4 h-4" />
      {{ $t('common.edit') }}
    </button>
    <button
      v-if="isAdmin"
      @click="handleAction('delete')"
      class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
    >
      <TrashIcon class="w-4 h-4" />
      {{ $t('common.delete') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Group } from '../types';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/features/auth/store';

interface GroupActionMenuProps {
  position: { x: number; y: number };
  group: Group;
}

const props = defineProps<GroupActionMenuProps>();

const emit = defineEmits<{
  close: [];
  edit: [group: Group];
  delete: [group: Group];
}>();

const auth = useAuthStore();
const menuRef = ref<HTMLElement>();

const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const handleAction = (action: 'edit' | 'delete') => {
  switch (action) {
    case 'edit':
      emit('edit', props.group);
      break;
    case 'delete':
      emit('delete', props.group);
      break;
  }
  emit('close');
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  if (menuRef.value) {
    const rect = menuRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth) {
      menuRef.value.style.left = `${props.position.x - rect.width}px`;
    }

    if (rect.bottom > viewportHeight) {
      menuRef.value.style.top = `${props.position.y - rect.height}px`;
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
