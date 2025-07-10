<template>
  <div class="backup-settings">
    <div class="section-header mb-6">
      <h3 class="text-xl font-semibold dark:text-gray-100">
        {{ $t('admin.systemSettings.backup.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('admin.systemSettings.backup.description') }}
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
        <el-form-item :label="$t('admin.systemSettings.backup.enabled')">
          <el-switch v-model="localSettings.enabled" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.backup.enabledHelp') }}
          </p>
        </el-form-item>
      </div>

      <div v-if="localSettings.enabled" class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.backup.schedule') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.backup.interval')"
          prop="schedule.interval"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.schedule.interval"
              :min="1"
              :max="168"
              :step="1"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('common.hours')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.backup.intervalHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.backup.retention')"
          prop="schedule.retention"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localSettings.schedule.retention"
              :min="1"
              :max="365"
              :step="1"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('common.days')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.backup.retentionHelp') }}
          </p>
        </el-form-item>
      </div>

      <div v-if="localSettings.enabled" class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.backup.storage') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.backup.storageType')"
          prop="storage.type"
        >
          <el-radio-group v-model="localSettings.storage.type">
            <el-radio value="local">{{
              $t('admin.systemSettings.backup.storageLocal')
            }}</el-radio>
            <el-radio value="s3">{{
              $t('admin.systemSettings.backup.storageS3')
            }}</el-radio>
            <el-radio value="azure">{{
              $t('admin.systemSettings.backup.storageAzure')
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="localSettings.storage.type === 'local'"
          :label="$t('admin.systemSettings.backup.storagePath')"
          prop="storage.path"
        >
          <el-input
            v-model="localSettings.storage.path"
            :placeholder="
              $t('admin.systemSettings.backup.storagePathPlaceholder')
            "
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.backup.storagePathHelp') }}
          </p>
        </el-form-item>

        <div
          v-if="localSettings.storage.type === 's3'"
          class="storage-credentials"
        >
          <el-form-item
            label="AWS Access Key ID"
            prop="storage.credentials.accessKeyId"
          >
            <el-input
              v-model="localSettings.storage.credentials!.accessKeyId"
              type="password"
              show-password
              placeholder="AKIA..."
            />
          </el-form-item>

          <el-form-item
            label="AWS Secret Access Key"
            prop="storage.credentials.secretAccessKey"
          >
            <el-input
              v-model="localSettings.storage.credentials!.secretAccessKey"
              type="password"
              show-password
              :placeholder="credentialsPlaceholder('secretAccessKey')"
            />
          </el-form-item>

          <el-form-item label="S3 Bucket" prop="storage.credentials.bucket">
            <el-input
              v-model="localSettings.storage.credentials!.bucket"
              placeholder="my-backup-bucket"
            />
          </el-form-item>

          <el-form-item label="AWS Region" prop="storage.credentials.region">
            <el-select
              v-model="localSettings.storage.credentials!.region"
              class="w-full"
            >
              <el-option value="us-east-1" label="US East (N. Virginia)" />
              <el-option value="us-west-2" label="US West (Oregon)" />
              <el-option value="eu-west-1" label="EU (Ireland)" />
              <el-option value="eu-central-1" label="EU (Frankfurt)" />
              <el-option
                value="ap-southeast-1"
                label="Asia Pacific (Singapore)"
              />
              <el-option value="ap-northeast-1" label="Asia Pacific (Tokyo)" />
            </el-select>
          </el-form-item>
        </div>

        <div
          v-if="localSettings.storage.type === 'azure'"
          class="storage-credentials"
        >
          <el-form-item
            label="Azure Storage Account"
            prop="storage.credentials.accountName"
          >
            <el-input
              v-model="localSettings.storage.credentials!.accountName"
              placeholder="mystorageaccount"
            />
          </el-form-item>

          <el-form-item
            label="Azure Storage Key"
            prop="storage.credentials.accountKey"
          >
            <el-input
              v-model="localSettings.storage.credentials!.accountKey"
              type="password"
              show-password
              :placeholder="credentialsPlaceholder('accountKey')"
            />
          </el-form-item>

          <el-form-item
            label="Container Name"
            prop="storage.credentials.containerName"
          >
            <el-input
              v-model="localSettings.storage.credentials!.containerName"
              placeholder="backups"
            />
          </el-form-item>
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
import type { BackupSettings } from '../types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  settings: BackupSettings;
}

interface Emits {
  (e: 'update', value: BackupSettings): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const saving = ref(false);
const localSettings = ref<BackupSettings>({
  ...props.settings,
  storage: {
    ...props.settings.storage,
    credentials: props.settings.storage.credentials || {},
  },
});

const credentialsPlaceholder = (key: string) => {
  const existing = props.settings.storage.credentials?.[key];
  return existing
    ? t('admin.systemSettings.backup.credentialUnchanged')
    : t('admin.systemSettings.backup.credentialPlaceholder');
};

const rules: FormRules = {
  'schedule.interval': [
    {
      type: 'number',
      min: 1,
      max: 168,
      message: t('validation.range', { min: 1, max: 168 }),
      trigger: 'blur',
    },
  ],
  'schedule.retention': [
    {
      type: 'number',
      min: 1,
      max: 365,
      message: t('validation.range', { min: 1, max: 365 }),
      trigger: 'blur',
    },
  ],
  'storage.type': [
    { required: true, message: t('validation.required'), trigger: 'change' },
  ],
  'storage.path': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 'local' &&
          !value
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.accessKeyId': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 's3' &&
          !value &&
          !props.settings.storage.credentials?.accessKeyId
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.secretAccessKey': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 's3' &&
          !value &&
          !props.settings.storage.credentials?.secretAccessKey
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.bucket': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 's3' &&
          !value
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.region': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 's3' &&
          !value
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.accountName': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 'azure' &&
          !value
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.accountKey': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 'azure' &&
          !value &&
          !props.settings.storage.credentials?.accountKey
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'storage.credentials.containerName': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (
          localSettings.value.enabled &&
          localSettings.value.storage.type === 'azure' &&
          !value
        ) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
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
        category: t('admin.systemSettings.tabs.backup'),
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
    localSettings.value = {
      ...newSettings,
      storage: {
        ...newSettings.storage,
        credentials: {
          ...localSettings.value.storage.credentials,
          ...newSettings.storage.credentials,
        },
      },
    };
  },
  { deep: true },
);

watch(
  () => localSettings.value.storage.type,
  () => {
    if (!localSettings.value.storage.credentials) {
      localSettings.value.storage.credentials = {};
    }
  },
);
</script>

<style scoped>
.backup-settings {
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

.storage-credentials {
  @apply space-y-4;
}
</style>
