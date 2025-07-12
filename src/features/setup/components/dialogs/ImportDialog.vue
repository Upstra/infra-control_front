<template>
  <Modal :open="open" @close="$emit('update:open', false)">
    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
      <div class="mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {{ t('setup.import_dialog.title') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('setup.import_dialog.description') }}
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('setup.import_dialog.format_label') }}
          </label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                v-model="format"
                type="radio"
                value="json"
                class="mr-2"
              />
              JSON
            </label>
            <label class="flex items-center">
              <input
                v-model="format"
                type="radio"
                value="csv"
                class="mr-2"
              />
              CSV
            </label>
          </div>
        </div>

        <div>
          <label for="import-file" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('setup.import_dialog.file_label') }}
          </label>
          <input
            id="import-file"
            ref="fileInput"
            type="file"
            :accept="format === 'json' ? '.json' : '.csv'"
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              dark:file:bg-indigo-900 dark:file:text-indigo-200"
          />
        </div>

        <div v-if="format === 'json'" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ t('setup.import_dialog.json_format') }}
          </h4>
          <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{{ jsonExample }}</pre>
        </div>

        <div v-if="format === 'csv'" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ t('setup.import_dialog.csv_format') }}
          </h4>
          <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{{ csvExample }}</pre>
        </div>

        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>
      </div>

      <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="button"
          @click="handleImport"
          :disabled="!fileData"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('setup.import_dialog.import_button') }}
        </button>
        <button
          type="button"
          @click="$emit('update:open', false)"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

const format = ref<'json' | 'csv'>('json');
const fileData = ref<any>(null);
const error = ref<string>('');
const fileInput = ref<HTMLInputElement>();

const jsonExample = computed(() => {
  if (props.resourceType === 'rooms') {
    return JSON.stringify({
      rooms: [
        {
          name: "Server Room 1",
          location: "Building A",
          capacity: 20,
          coolingType: "air"
        }
      ]
    }, null, 2);
  } else if (props.resourceType === 'ups') {
    return JSON.stringify({
      upsList: [
        {
          name: "UPS-01",
          ip: "192.168.1.100",
          brand: "APC",
          model: "Smart-UPS"
        }
      ]
    }, null, 2);
  } else if (props.resourceType === 'servers') {
    return JSON.stringify({
      servers: [
        {
          name: "WEB-01",
          ip: "192.168.1.10",
          type: "physical",
          priority: 1,
          grace_period_on: 30,
          grace_period_off: 30,
          adminUrl: "https://192.168.1.10",
          login: "admin",
          password: "password"
        }
      ]
    }, null, 2);
  }
  return '{}';
});

const csvExample = computed(() => {
  if (props.resourceType === 'rooms') {
    return 'name\nServer Room 1';
  } else if (props.resourceType === 'ups') {
    return 'name,ip\nUPS-01,192.168.1.100';
  } else if (props.resourceType === 'servers') {
    return 'name,ip,type,priority,grace_period_on,grace_period_off,adminUrl,login,password\nWEB-01,192.168.1.10,physical,1,30,30,https://192.168.1.10,admin,password';
  }
  return '';
});

const parseCsv = (text: string, resourceType: string) => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have header and at least one data row');
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      let value: any = values[index];
      if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      }
      obj[header] = value;
    });
    return obj;
  });
  
  return {
    [resourceType === 'ups' ? 'upsList' : resourceType]: data
  };
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  error.value = '';
  
  try {
    const text = await file.text();
    
    if (format.value === 'json') {
      fileData.value = JSON.parse(text);
    } else {
      fileData.value = parseCsv(text, props.resourceType);
    }
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