<template>
  <div class="email-settings">
    <div class="section-header mb-6">
      <h3 class="text-xl font-semibold dark:text-gray-100">
        {{ $t('admin.systemSettings.email.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('admin.systemSettings.email.description') }}
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
        <el-form-item :label="$t('admin.systemSettings.email.enabled')">
          <el-switch v-model="localSettings.enabled" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.email.enabledHelp') }}
          </p>
        </el-form-item>
      </div>

      <div v-if="localSettings.enabled" class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.email.smtp') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.email.host')"
          prop="smtp.host"
        >
          <el-input
            v-model="localSettings.smtp.host"
            :placeholder="$t('admin.systemSettings.email.hostPlaceholder')"
          />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            :label="$t('admin.systemSettings.email.port')"
            prop="smtp.port"
          >
            <el-input-number
              v-model="localSettings.smtp.port"
              :min="1"
              :max="65535"
              class="w-full"
            />
          </el-form-item>

          <el-form-item :label="$t('admin.systemSettings.email.secure')">
            <el-switch v-model="localSettings.smtp.secure" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ $t('admin.systemSettings.email.secureHelp') }}
            </p>
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            :label="$t('admin.systemSettings.email.user')"
            prop="smtp.user"
          >
            <el-input
              v-model="localSettings.smtp.user"
              :placeholder="$t('admin.systemSettings.email.userPlaceholder')"
            />
          </el-form-item>

          <el-form-item
            :label="$t('admin.systemSettings.email.password')"
            prop="smtp.password"
          >
            <el-input
              v-model="localSettings.smtp.password"
              type="password"
              show-password
              :placeholder="passwordPlaceholder"
            />
          </el-form-item>
        </div>
      </div>

      <div v-if="localSettings.enabled" class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.email.sender') }}
        </h4>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            :label="$t('admin.systemSettings.email.fromName')"
            prop="from.name"
          >
            <el-input
              v-model="localSettings.from.name"
              :placeholder="
                $t('admin.systemSettings.email.fromNamePlaceholder')
              "
            />
          </el-form-item>

          <el-form-item
            :label="$t('admin.systemSettings.email.fromAddress')"
            prop="from.address"
          >
            <el-input
              v-model="localSettings.from.address"
              :placeholder="
                $t('admin.systemSettings.email.fromAddressPlaceholder')
              "
            />
          </el-form-item>
        </div>
      </div>

      <div v-if="localSettings.enabled" class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.email.test') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.email.testEmail')"
          prop="testEmail"
        >
          <div class="flex gap-2">
            <el-input
              v-model="testEmail"
              :placeholder="
                $t('admin.systemSettings.email.testEmailPlaceholder')
              "
              @keyup.enter="handleTestEmail"
            />
            <el-button
              @click="handleTestEmail"
              :disabled="!testEmail || testing"
              :loading="testing"
            >
              {{ $t('admin.systemSettings.email.sendTest') }}
            </el-button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.email.testEmailHelp') }}
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
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import type { EmailSettings } from '../types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  settings: EmailSettings;
}

interface Emits {
  (e: 'update', value: EmailSettings): void;
  (e: 'reset'): void;
  (e: 'test', email: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const saving = ref(false);
const testing = ref(false);
const testEmail = ref('');
const localSettings = ref<EmailSettings>({ ...props.settings });

const passwordPlaceholder = computed(() =>
  props.settings.smtp.password
    ? t('admin.systemSettings.email.passwordUnchanged')
    : t('admin.systemSettings.email.passwordPlaceholder'),
);

const rules: FormRules = {
  'smtp.host': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.enabled && !value) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'smtp.port': [
    {
      type: 'number',
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.enabled && !value) {
          callback(new Error(t('validation.required')));
        } else if (value && (value < 1 || value > 65535)) {
          callback(new Error(t('validation.range', { min: 1, max: 65535 })));
        } else {
          callback();
        }
      },
    },
  ],
  'smtp.user': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.enabled && !value) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'from.name': [
    {
      required: true,
      message: t('validation.required'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.enabled && !value) {
          callback(new Error(t('validation.required')));
        } else {
          callback();
        }
      },
    },
  ],
  'from.address': [
    {
      required: true,
      type: 'email',
      message: t('validation.email'),
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (localSettings.value.enabled && !value) {
          callback(new Error(t('validation.required')));
        } else if (value && !/.+@.+\..+/.test(value)) {
          callback(new Error(t('validation.email')));
        } else {
          callback();
        }
      },
    },
  ],
  testEmail: [
    { type: 'email', message: t('validation.email'), trigger: 'blur' },
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
        category: t('admin.systemSettings.tabs.email'),
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

const handleTestEmail = async () => {
  if (!testEmail.value || testing.value) return;

  const emailRegex = /.+@.+\..+/;
  if (!emailRegex.test(testEmail.value)) {
    ElMessage.error(t('validation.email'));
    return;
  }

  testing.value = true;
  try {
    emit('test', testEmail.value);
  } finally {
    setTimeout(() => {
      testing.value = false;
    }, 1000);
  }
};

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = {
      ...newSettings,
      smtp: {
        ...newSettings.smtp,
        password:
          localSettings.value.smtp.password || newSettings.smtp.password,
      },
    };
  },
  { deep: true },
);
</script>

<style scoped>
.email-settings {
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
