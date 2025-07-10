<template>
  <TransitionRoot appear :show="visible" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4"
              >
                {{ $t('admin.systemSettings.importExport') }}
              </DialogTitle>

              <div class="import-export-content">
                <TabGroup
                  :selectedIndex="activeTabIndex"
                  @change="activeTabIndex = $event"
                >
                  <TabList
                    class="flex space-x-1 rounded-xl bg-gray-100 dark:bg-neutral-700 p-1"
                  >
                    <Tab v-slot="{ selected }" as="template">
                      <button
                        :class="[
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white dark:bg-neutral-600 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100',
                        ]"
                      >
                        {{ $t('admin.systemSettings.export') }}
                      </button>
                    </Tab>
                    <Tab v-slot="{ selected }" as="template">
                      <button
                        :class="[
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white dark:bg-neutral-600 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-100',
                        ]"
                      >
                        {{ $t('admin.systemSettings.import') }}
                      </button>
                    </Tab>
                  </TabList>

                  <TabPanels class="mt-4">
                    <TabPanel>
                      <div class="export-section">
                        <p class="mb-4 text-gray-600 dark:text-gray-400">
                          {{ $t('admin.systemSettings.exportDescription') }}
                        </p>

                        <div class="export-options mb-6">
                          <h4
                            class="text-sm font-medium mb-2 dark:text-gray-200"
                          >
                            {{ $t('admin.systemSettings.exportOptions') }}
                          </h4>
                          <div class="space-y-2">
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                :checked="
                                  exportOptions.includes('includeSensitive')
                                "
                                @change="toggleExportOption('includeSensitive')"
                                class="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span
                                class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                              >
                                {{
                                  $t('admin.systemSettings.includeSensitive')
                                }}
                              </span>
                            </label>
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                :checked="
                                  exportOptions.includes('includeMetadata')
                                "
                                @change="toggleExportOption('includeMetadata')"
                                class="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span
                                class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                              >
                                {{ $t('admin.systemSettings.includeMetadata') }}
                              </span>
                            </label>
                          </div>
                        </div>

                        <button
                          @click="handleExport"
                          :disabled="exporting"
                          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                          {{ $t('admin.systemSettings.downloadSettings') }}
                        </button>
                      </div>
                    </TabPanel>

                    <TabPanel>
                      <div class="import-section">
                        <p class="mb-4 text-gray-600 dark:text-gray-400">
                          {{ $t('admin.systemSettings.importDescription') }}
                        </p>

                        <div class="upload-area">
                          <label
                            for="file-upload"
                            class="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                          >
                            <ArrowUpTrayIcon
                              class="w-12 h-12 mx-auto mb-2 text-gray-400"
                            />
                            <span
                              class="text-sm text-gray-600 dark:text-gray-400"
                            >
                              {{ $t('admin.systemSettings.dropFile') }}
                              <span class="text-primary">{{
                                $t('admin.systemSettings.clickToUpload')
                              }}</span>
                            </span>
                            <input
                              id="file-upload"
                              ref="fileInputRef"
                              type="file"
                              accept=".json"
                              class="sr-only"
                              @change="handleFileChange"
                            />
                          </label>
                          <p
                            class="text-xs text-gray-500 dark:text-gray-400 mt-2"
                          >
                            {{ $t('admin.systemSettings.uploadTip') }}
                          </p>
                        </div>

                        <div v-if="importData" class="import-preview mt-6">
                          <h4
                            class="text-sm font-medium mb-2 dark:text-gray-200"
                          >
                            {{ $t('admin.systemSettings.previewTitle') }}
                          </h4>
                          <div
                            class="preview-info bg-gray-50 dark:bg-gray-800 rounded p-4 text-sm"
                          >
                            <p>
                              <strong
                                >{{
                                  $t('admin.systemSettings.version')
                                }}:</strong
                              >
                              {{ importData.version }}
                            </p>
                            <p>
                              <strong
                                >{{
                                  $t('admin.systemSettings.exportedAt')
                                }}:</strong
                              >
                              {{ formatDate(importData.exportedAt) }}
                            </p>
                            <p class="mt-2">
                              <strong
                                >{{
                                  $t('admin.systemSettings.categories')
                                }}:</strong
                              >
                              <span class="ml-2">{{
                                Object.keys(importData.settings).join(', ')
                              }}</span>
                            </p>
                          </div>

                          <div
                            class="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4"
                          >
                            <div class="flex">
                              <div class="flex-shrink-0">
                                <svg
                                  class="h-5 w-5 text-yellow-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div class="ml-3">
                                <h3
                                  class="text-sm font-medium text-yellow-800 dark:text-yellow-200"
                                >
                                  {{ $t('admin.systemSettings.importWarning') }}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <div class="mt-4 flex justify-end gap-2">
                            <button
                              @click="handleCancelImport"
                              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              {{ $t('common.cancel') }}
                            </button>
                            <button
                              @click="handleConfirmImport"
                              :disabled="importing"
                              class="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {{ $t('admin.systemSettings.confirmImport') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@headlessui/vue';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import type { ImportSettingsDto } from '../types';

interface Emits {
  (e: 'close'): void;
  (e: 'export'): void;
  (e: 'import', data: ImportSettingsDto): void;
}

const emit = defineEmits<Emits>();
const { t } = useI18n();
const toast = useToast();

const visible = ref(true);
const activeTabIndex = ref(0);
const exporting = ref(false);
const importing = ref(false);
const exportOptions = ref(['includeMetadata']);
const importData = ref<ImportSettingsDto | null>(null);
const fileInputRef = ref<HTMLInputElement>();

const handleClose = () => {
  emit('close');
};

const handleExport = async () => {
  exporting.value = true;
  try {
    emit('export');
  } finally {
    setTimeout(() => {
      exporting.value = false;
    }, 1000);
  }
};

const toggleExportOption = (option: string) => {
  const index = exportOptions.value.indexOf(option);
  if (index > -1) {
    exportOptions.value.splice(index, 1);
  } else {
    exportOptions.value.push(option);
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      if (!validateImportData(data)) {
        toast.error(t('admin.systemSettings.invalidFile'));
        if (fileInputRef.value) {
          fileInputRef.value.value = '';
        }
        return;
      }

      importData.value = data;
    } catch (error) {
      toast.error(t('admin.systemSettings.parseError'));
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }
  };
  reader.readAsText(file);
};

const validateImportData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || !data.exportedAt || !data.settings) return false;
  if (typeof data.settings !== 'object') return false;

  const requiredCategories = [
    'security',
    'system',
    'email',
    'backup',
    'logging',
  ];
  const hasAllCategories = requiredCategories.every(
    (cat) => cat in data.settings,
  );

  return hasAllCategories;
};

const handleCancelImport = () => {
  importData.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleConfirmImport = async () => {
  if (!importData.value) return;

  const confirmed = window.confirm(t('admin.systemSettings.importConfirm'));

  if (confirmed) {
    importing.value = true;
    emit('import', importData.value);
  }
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString();
};
</script>

<style scoped>
.import-export-content {
  min-height: 400px;
}

.export-section,
.import-section {
  padding: 1rem 0;
}

.export-options {
  border: 1px solid;
  border-radius: 0.5rem;
  padding: 1rem;
}

.upload-area {
  width: 100%;
}

.preview-info p {
  margin-bottom: 0.25rem;
}
</style>
