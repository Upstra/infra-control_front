<template>
  <Modal :open="open" @close="$emit('update:open', false)">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{ t('setup.template_dialog.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('setup.template_dialog.description') }}
        </p>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-pulse text-gray-500 dark:text-gray-400">
          {{ t('setup.template_dialog.loading') }}
        </div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="template in templates"
          :key="template.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-colors"
          @click="selectTemplate(template)"
        >
          <h4 class="font-medium text-gray-900 dark:text-white">
            {{ template.name }}
          </h4>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ template.description }}
          </p>
          <div class="mt-3 space-y-2">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <Building2 :size="14" />
                {{ t('setup.template_dialog.rooms_count', { count: template.configuration.rooms?.length || 0 }) }}
              </span>
              <span class="flex items-center gap-1">
                <Server :size="14" />
                {{ t('setup.template_dialog.servers_count', { count: template.configuration.servers?.length || 0 }) }}
              </span>
              <span class="flex items-center gap-1">
                <Zap :size="14" />
                {{ t('setup.template_dialog.ups_count', { count: template.configuration.upsList?.length || 0 }) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 sm:mt-6">
        <button
          type="button"
          @click="$emit('update:open', false)"
          class="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Building2, Server, Zap } from 'lucide-vue-next';
import Modal from '@/shared/components/Modal.vue';
import { useSetupStore } from '../../store';
import { useToast } from 'vue-toast-notification';
import type { SetupTemplate } from '../../types';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  apply: [template: SetupTemplate];
}>();

const { t } = useI18n();
const setupStore = useSetupStore();
const toast = useToast();

const templates = ref<SetupTemplate[]>([]);
const isLoading = ref(false);

const loadTemplates = async () => {
  isLoading.value = true;
  try {
    const result = await setupStore.loadTemplates();
    templates.value = result.templates;
  } catch (error) {
    console.error('Failed to load templates:', error);
    toast.error(t('setup.template_dialog.load_error'));
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.open, (newOpen) => {
  if (newOpen && templates.value.length === 0) {
    loadTemplates();
  }
});

const selectTemplate = (template: SetupTemplate) => {
  emit('apply', template);
};
</script>