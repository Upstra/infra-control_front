<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-text-strong tracking-tight"
      >
        {{ t('setup.planning.title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-text-strong max-w-lg mx-auto"
      >
        {{ t('setup.planning.description') }}
      </p>
    </div>

    <div class="w-full max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-if="isLoading" class="col-span-full flex justify-center">
          <div class="animate-pulse text-text-muted">
            {{ t('setup.planning.loading_templates') }}
          </div>
        </div>
        <div
          v-for="template in templates"
          :key="template.id"
          @click="selectTemplate(template)"
          class="bg-surface rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2"
          :class="
            selectedTemplate?.id === template.id
              ? 'border-primary'
              : 'border-transparent'
          "
        >
          <h3 class="text-lg font-semibold text-text-strong mb-2">
            {{ template.name }}
          </h3>
          <p class="text-sm text-text mb-4">
            {{ template.description }}
          </p>
          <div class="space-y-2">
            <div
              class="flex items-center gap-2 mb-1 text-text"
            >
              <Building2 :size="14" class="text-text" />
              {{ template.configuration.rooms?.length || 0 }}
              {{ t('setup.planning.rooms') }}
            </div>
            <div
              class="flex items-center gap-2 mb-1 text-text"
            >
              <Server :size="14" class="text-text" />
              {{ template.configuration.servers?.length || 0 }}
              {{ t('setup.planning.servers') }}
            </div>
            <div
              class="flex items-center gap-2 text-text"
            >
              <Zap :size="14" class="text-text" />
              {{ template.configuration.upsList?.length || 0 }}
              {{ t('setup.planning.ups_devices') }}
            </div>
          </div>
        </div>

        <div
          @click="selectTemplate(null)"
          class="bg-surface rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2"
          :class="
            selectedTemplate === null
              ? 'border-primary'
              : 'border-transparent'
          "
        >
          <h3 class="text-lg font-semibold text-text-strong mb-2">
            {{ t('setup.planning.custom_title') }}
          </h3>
          <p class="text-sm text-text mb-4">
            {{ t('setup.planning.custom_description') }}
          </p>
          <div class="flex items-center justify-center h-20">
            <Settings :size="40" class="text-text-muted" />
          </div>
        </div>
      </div>

      <div
        v-if="selectedTemplate"
        class="bg-[rgb(var(--c-primary-hover)/0.1)] border border-primary-dark rounded-lg p-4 mb-6"
      >
        <div class="flex">
          <Info
            :size="20"
            class="text-primary-text flex-shrink-0 mt-0.5"
          />
          <div class="ml-3">
            <p class="text-sm text-primary-text">
              {{
                t('setup.planning.template_selected', {
                  name: selectedTemplate.name,
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-between">
        <button
          @click="handleSkip"
          class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {{ t('setup.planning.skip_button') }}
        </button>

        <button
          @click="handleContinue"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {{ t('setup.planning.continue_button') }}
          <ChevronRight :size="20" class="ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import {
  Building2,
  Server,
  Zap,
  Settings,
  Info,
  ChevronRight,
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import type { SetupTemplate } from '../../types';

const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

const selectedTemplate = ref<SetupTemplate | null>(null);
const templates = ref<SetupTemplate[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const result = await setupStore.loadTemplates();
    templates.value = result.templates;
  } catch (error) {
    console.error('Failed to load templates:', error);
    toast.error(t('setup.planning.template_load_error'));
  } finally {
    isLoading.value = false;
  }
});

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
