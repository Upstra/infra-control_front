<template>
  <Modal :open="open" @close="$emit('update:open', false)">
    <div class="bg-surface px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-text-strong">
          {{ t('setup.import_dialog.title') }}
        </h3>
        <p class="mt-1 text-sm text-text-muted">
          {{ t('setup.import_dialog.description') }}
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <label
            for="import-file"
            class="block text-sm font-medium text-text mb-2"
          >
            {{ t('setup.import_dialog.file_label') }}
          </label>
          <input
            id="import-file"
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileChange"
            class="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-200"
          />
        </div>

        <div class="bg-surface-sunken rounded-lg p-4">
          <h4 class="text-sm font-medium text-text-strong mb-2">
            {{ t('setup.import_dialog.json_format') }}
          </h4>
          <pre
            class="text-xs text-text overflow-x-auto"
            >{{ jsonExample }}</pre
          >
        </div>

        <div v-if="error" class="text-danger-text text-sm">
          {{ error }}
        </div>
      </div>

      <div
        class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
      >
        <button
          type="button"
          @click="handleImport"
          :disabled="!fileData"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('setup.import_dialog.import_button') }}
        </button>
        <button
          type="button"
          @click="$emit('update:open', false)"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-border-control shadow-sm px-4 py-2 bg-surface text-base font-medium text-text hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/shared/components/Modal.vue';

interface Props {
  open: boolean;
  resourceType: 'rooms' | 'servers' | 'ups';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  import: [data: any];
}>();

const { t } = useI18n();

const fileData = ref<any>(null);
const error = ref<string>('');
const fileInput = ref<HTMLInputElement>();

const jsonExample = computed(() => {
  if (props.resourceType === 'rooms') {
    return JSON.stringify(
      {
        rooms: [
          {
            name: 'Server Room 1',
          },
        ],
      },
      null,
      2,
    );
  } else if (props.resourceType === 'ups') {
    return JSON.stringify(
      {
        upsList: [
          {
            name: 'UPS-01',
            ip: '192.168.1.100',
          },
        ],
      },
      null,
      2,
    );
  } else if (props.resourceType === 'servers') {
    return JSON.stringify(
      {
        servers: [
          {
            name: 'WEB-01',
            ip: '192.168.1.10',
            type: 'vcenter',
            priority: 1,
            adminUrl: 'https://192.168.1.10',
            login: 'admin',
            password: 'password',
          },
        ],
      },
      null,
      2,
    );
  }
  return '{}';
});

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  error.value = '';

  try {
    const text = await file.text();
    fileData.value = JSON.parse(text);
  } catch (e: any) {
    error.value = e.message || t('setup.import_dialog.parse_error');
    fileData.value = null;
  }
};

const handleImport = () => {
  if (fileData.value) {
    emit('import', fileData.value);
    emit('update:open', false);
  }
};
</script>
