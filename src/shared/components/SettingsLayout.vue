<script setup lang="ts">
import { ref } from 'vue';
import type { Component } from 'vue';

export interface SettingSection {
  id: string;
  icon: Component;
  title: string;
  description: string;
}

defineProps<{
  sections: SettingSection[];
  title: string;
  subtitle: string;
}>();

const activeSection = ref<string>('');

const emit = defineEmits<{
  sectionChange: [section: string];
}>();

const setActiveSection = (section: string) => {
  activeSection.value = section;
  emit('sectionChange', section);
};

const initializeSection = (sections: SettingSection[]) => {
  if (sections.length > 0 && !activeSection.value) {
    setActiveSection(sections[0].id);
  }
};

defineExpose({
  activeSection,
  initializeSection,
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-neutral-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1
          class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          {{ title }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav class="lg:col-span-1">
          <ul class="space-y-1">
            <li v-for="section in sections" :key="section.id">
              <button
                @click="setActiveSection(section.id)"
                :class="[
                  'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800',
                ]"
              >
                <component
                  :is="section.icon"
                  class="mr-3 h-5 w-5 flex-shrink-0"
                />
                <div class="text-left">
                  <p class="font-medium">{{ $t(section.title) }}</p>
                  <p
                    v-if="activeSection !== section.id"
                    class="text-xs opacity-70 mt-0.5"
                  >
                    {{ $t(section.description) }}
                  </p>
                </div>
              </button>
            </li>
          </ul>
        </nav>

        <div class="lg:col-span-3">
          <transition name="fade-slide" mode="out-in">
            <div
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <slot :activeSection="activeSection" />
            </div>
          </transition>

          <div class="mt-6 flex justify-end space-x-3">
            <slot name="actions">
              <button
                class="px-6 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-md"
              >
                {{ $t('common.save') }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
