<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight">
        {{ t('setup.planning.title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
        {{ t('setup.planning.description') }}
      </p>
    </div>

    <div class="w-full max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          v-for="template in setupStore.PREDEFINED_TEMPLATES"
          :key="template.name"
          @click="selectTemplate(template)"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2"
          :class="selectedTemplate?.name === template.name ? 'border-indigo-500' : 'border-transparent'"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ template.name }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ template.description }}
          </p>
          <div v-if="template.configuration.quickSetups" class="space-y-2">
            <div
              v-for="setup in template.configuration.quickSetups"
              :key="setup.name"
              class="text-sm text-gray-500 dark:text-gray-300"
            >
              <div class="flex items-center gap-2 mb-1">
                <Building2 :size="14" />
                {{ setup.rooms }} {{ t('setup.planning.rooms') }}
              </div>
              <div class="flex items-center gap-2 mb-1">
                <Server :size="14" />
                {{ setup.serversPerRoom }} {{ t('setup.planning.servers_per_room') }}
              </div>
              <div class="flex items-center gap-2">
                <Zap :size="14" />
                {{ setup.upsPerRoom }} {{ t('setup.planning.ups_per_room') }}
              </div>
            </div>
          </div>
        </div>

        <div
          @click="selectTemplate(null)"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2"
          :class="selectedTemplate === null ? 'border-indigo-500' : 'border-transparent'"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('setup.planning.custom_title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ t('setup.planning.custom_description') }}
          </p>
          <div class="flex items-center justify-center h-20">
            <Settings :size="40" class="text-gray-400" />
          </div>
        </div>
      </div>

      <div v-if="selectedTemplate" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div class="flex">
          <Info :size="20" class="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div class="ml-3">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              {{ t('setup.planning.template_selected', { name: selectedTemplate.name }) }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-between">
        <button
          @click="handleSkip"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ t('setup.planning.skip_button') }}
        </button>

        <button
          @click="handleContinue"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ t('setup.planning.continue_button') }}
          <ChevronRight :size="20" class="ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, Server, Zap, Settings, Info, ChevronRight } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import type { SetupTemplate } from '../../types';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const selectedTemplate = ref<SetupTemplate | null>(null);

const selectTemplate = (template: SetupTemplate | null) => {
  selectedTemplate.value = template;
};

const handleSkip = async () => {
  await setupStore.goToNextStep();
};

const handleContinue = async () => {
  if (selectedTemplate.value) {
    setupStore.applyTemplate(selectedTemplate.value);
    toast.success(t('setup.planning.template_applied'));
  }
  await setupStore.goToNextStep();
};
</script>