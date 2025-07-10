<template>
  <div class="system-settings">
    <div class="section-header mb-6">
      <h3 class="text-xl font-semibold dark:text-gray-100">
        {{ $t('admin.systemSettings.system.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('admin.systemSettings.system.description') }}
      </p>
    </div>

    <el-form
      :model="localSettings"
      :rules="rules"
      ref="formRef"
      label-position="top"
      @change="handleChange"
    >
      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.system.maintenance') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.system.maintenanceMode')"
        >
          <el-switch
            v-model="localSettings.maintenanceMode"
            :before-change="confirmMaintenanceMode"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.maintenanceModeHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.system.maintenanceMessage')"
          prop="maintenanceMessage"
        >
          <el-input
            v-model="localSettings.maintenanceMessage"
            type="textarea"
            :rows="3"
            :disabled="!localSettings.maintenanceMode"
            :placeholder="
              $t('admin.systemSettings.system.maintenanceMessagePlaceholder')
            "
          />
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.system.uploads') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.system.maxUploadSize')"
          prop="maxUploadSize"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.maxUploadSize"
              :min="1"
              :max="1024"
              :step="1"
            />
            <span class="text-gray-600 dark:text-gray-400">MB</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.maxUploadSizeHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.system.allowedFileTypes')"
          prop="allowedFileTypes"
        >
          <el-select
            v-model="localSettings.allowedFileTypes"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="
              $t('admin.systemSettings.system.allowedFileTypesPlaceholder')
            "
            class="w-full"
          >
            <el-option
              v-for="item in commonFileTypes"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.allowedFileTypesHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.system.api') }}
        </h4>

        <el-form-item :label="$t('admin.systemSettings.system.apiEnabled')">
          <el-switch v-model="localSettings.api.enabled" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.apiEnabledHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.system.rateLimit')"
          prop="api.rateLimit"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.api.rateLimit"
              :min="10"
              :max="1000"
              :step="10"
              :disabled="!localSettings.api.enabled"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('admin.systemSettings.system.requestsPerMinute')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.rateLimitHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.system.enableWebSockets')"
        >
          <el-switch v-model="localSettings.enableWebSockets" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.system.enableWebSocketsHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-actions flex justify-between">
        <el-button @click="handleReset" :disabled="saving">
          {{ $t('common.reset') }}
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ $t('common.save') }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import type { SystemConfig } from '../types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  settings: SystemConfig;
}

interface Emits {
  (e: 'update', value: SystemConfig): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const saving = ref(false);
const localSettings = ref<SystemConfig>({ ...props.settings });

const commonFileTypes = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.txt',
  '.csv',
  '.json',
  '.xml',
  '.zip',
  '.rar',
  '.tar',
  '.gz',
];

const rules: FormRules = {
  maintenanceMessage: [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.maintenanceMode && !value) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  maxUploadSize: [
    {
      type: 'number',
      min: 1,
      max: 1024,
      message: t('validation.range', { min: 1, max: 1024 }),
      trigger: 'blur',
    },
  ],
  allowedFileTypes: [
    {
      type: 'array',
      required: true,
      message: t('validation.required'),
      trigger: 'change',
    },
  ],
  'api.rateLimit': [
    {
      type: 'number',
      min: 10,
      max: 1000,
      message: t('validation.range', { min: 10, max: 1000 }),
      trigger: 'blur',
    },
  ],
};

const confirmMaintenanceMode = async () => {
  if (!localSettings.value.maintenanceMode) {
    try {
      await ElMessageBox.confirm(
        t('admin.systemSettings.system.maintenanceModeConfirm'),
        t('common.warning'),
        {
          type: 'warning',
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
        },
      );
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

const handleChange = () => {
  formRef.value?.validate(() => {});
};

const handleSave = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  saving.value = true;
  try {
    emit('update', localSettings.value);
  } finally {
    saving.value = false;
  }
};

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      t('admin.systemSettings.messages.resetConfirm', {
        category: t('admin.systemSettings.tabs.system'),
      }),
      t('common.confirm'),
      {
        type: 'warning',
        confirmButtonText: t('common.reset'),
        cancelButtonText: t('common.cancel'),
      },
    );
    emit('reset');
  } catch {}
};

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = { ...newSettings };
  },
  { deep: true },
);
</script>

<style scoped>
.system-settings {
  @apply max-w-4xl;
}

.form-section {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm;
}

.form-section-title {
  @apply text-lg font-medium mb-4 text-gray-900 dark:text-gray-100;
}

.el-form-item {
  @apply mb-4;
}

.el-form-item :deep(.el-form-item__label) {
  @apply font-medium text-gray-700 dark:text-gray-300;
}
</style>
