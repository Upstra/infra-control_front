<template>
  <Modal @close="emit('close')" size="lg">
    <template #header>
      {{ t('dashboard.templates.title') }}
    </template>

    <div class="space-y-4">
      <div v-if="loading" class="flex justify-center items-center h-48">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="text-center text-red-500 dark:text-red-400 p-8"
      >
        {{ t('dashboard.templates.error') }}
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="template in templates"
          :key="template.id"
          :class="[
            'relative rounded-lg border-2 p-4 cursor-pointer transition-all',
            selectedTemplate?.id === template.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          ]"
          @click="selectedTemplate = template"
        >
          <img
            v-if="template.preview"
            :src="template.preview"
            :alt="template.name"
            class="w-full h-32 object-cover rounded mb-3"
          />
          <div
            v-else
            class="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3 flex items-center justify-center"
          >
            <Icon name="layout" class="h-12 w-12 text-gray-400" />
          </div>

          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ template.name }}
          </h4>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ template.description }}
          </p>

          <div
            class="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500"
          >
            <Icon name="grid" class="h-3 w-3" />
            <span
              >{{ template.widgets.length }}
              {{ t('dashboard.templates.widgets') }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="selectedTemplate" class="mt-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t('dashboard.templates.layoutName') }}
        </label>
        <input
          v-model="layoutName"
          type="text"
          :placeholder="selectedTemplate.name"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        :disabled="!selectedTemplate"
        @click="createLayout"
        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        {{ t('dashboard.templates.create') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/shared/components/Modal.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { DashboardTemplate } from '../../types';

const emit = defineEmits<{
  close: [];
  select: [templateId: string, name: string];
}>();

const { t } = useI18n();
const dashboardStore = useDashboardStore();

const templates = ref<DashboardTemplate[]>([]);
const selectedTemplate = ref<DashboardTemplate | null>(null);
const layoutName = ref('');
const loading = ref(true);
const error = ref(false);

const loadTemplates = async () => {
  try {
    loading.value = true;
    error.value = false;
    await dashboardStore.loadTemplates();
    templates.value = dashboardStore.templates;
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const createLayout = () => {
  if (!selectedTemplate.value) return;

  const name = layoutName.value || selectedTemplate.value.name;
  emit('select', selectedTemplate.value.id, name);
};

onMounted(() => {
  loadTemplates();
});
</script>
