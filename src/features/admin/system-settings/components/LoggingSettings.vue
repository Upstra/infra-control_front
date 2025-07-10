<template>
  <div class="logging-settings">
    <div class="section-header mb-6">
      <h3 class="text-xl font-semibold dark:text-gray-100">
        {{ $t('admin.systemSettings.logging.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('admin.systemSettings.logging.description') }}
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
          {{ $t('admin.systemSettings.logging.general') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.logging.level')"
          prop="level"
        >
          <el-radio-group v-model="localSettings.level">
            <el-radio-button value="debug">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-gray-500"></span>
                {{ $t('admin.systemSettings.logging.levelDebug') }}
              </span>
            </el-radio-button>
            <el-radio-button value="info">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                {{ $t('admin.systemSettings.logging.levelInfo') }}
              </span>
            </el-radio-button>
            <el-radio-button value="warn">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                {{ $t('admin.systemSettings.logging.levelWarn') }}
              </span>
            </el-radio-button>
            <el-radio-button value="error">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                {{ $t('admin.systemSettings.logging.levelError') }}
              </span>
            </el-radio-button>
          </el-radio-group>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ $t('admin.systemSettings.logging.levelHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.logging.retention')"
          prop="retention"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.retention"
              :min="1"
              :max="365"
              :step="1"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('common.days')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.logging.retentionHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.logging.metrics') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.logging.metricsEnabled')"
        >
          <el-switch v-model="localSettings.metrics.enabled" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.logging.metricsEnabledHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          v-if="localSettings.metrics.enabled"
          :label="$t('admin.systemSettings.logging.metricsRetention')"
          prop="metrics.retention"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.metrics.retention"
              :min="1"
              :max="90"
              :step="1"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('common.days')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.logging.metricsRetentionHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.logging.info') }}
        </h4>

        <div class="info-grid grid gap-4">
          <div class="info-item">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('admin.systemSettings.logging.currentSize') }}
            </label>
            <p class="text-gray-900 dark:text-gray-100">
              {{ formatSize(estimatedLogSize) }}
            </p>
          </div>

          <div class="info-item">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('admin.systemSettings.logging.estimatedGrowth') }}
            </label>
            <p class="text-gray-900 dark:text-gray-100">
              {{ formatSize(estimatedDailyGrowth) }}/{{ $t('common.day') }}
            </p>
          </div>

          <div class="info-item">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('admin.systemSettings.logging.storageLocation') }}
            </label>
            <p class="text-gray-900 dark:text-gray-100 font-mono text-sm">
              /var/log/upstra
            </p>
          </div>
        </div>
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
import type { LoggingSettings } from '../types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  settings: LoggingSettings;
}

interface Emits {
  (e: 'update', value: LoggingSettings): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const saving = ref(false);
const localSettings = ref<LoggingSettings>({ ...props.settings });

const estimatedLogSize = ref(256 * 1024 * 1024);
const estimatedDailyGrowth = ref(10 * 1024 * 1024);

const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const rules: FormRules = {
  level: [
    { required: true, message: t('validation.required'), trigger: 'change' },
  ],
  retention: [
    {
      type: 'number',
      min: 1,
      max: 365,
      message: t('validation.range', { min: 1, max: 365 }),
      trigger: 'blur',
    },
  ],
  'metrics.retention': [
    {
      type: 'number',
      min: 1,
      max: 90,
      message: t('validation.range', { min: 1, max: 90 }),
      trigger: 'blur',
    },
  ],
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
        category: t('admin.systemSettings.tabs.logging'),
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

watch(
  () => localSettings.value.level,
  (newLevel) => {
    const growthMultipliers = {
      debug: 4,
      info: 2,
      warn: 1,
      error: 0.5,
    };
    estimatedDailyGrowth.value = 10 * 1024 * 1024 * growthMultipliers[newLevel];
  },
);
</script>

<style scoped>
.logging-settings {
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

.el-radio-group :deep(.el-radio-button__inner) {
  @apply px-4 py-2;
}

.info-grid {
  @apply grid-cols-1 md:grid-cols-3;
}

.info-item {
  @apply space-y-1;
}
</style>
