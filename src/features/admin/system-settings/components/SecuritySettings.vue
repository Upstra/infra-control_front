<template>
  <div class="security-settings">
    <div class="section-header mb-6">
      <h3 class="text-xl font-semibold dark:text-gray-100">
        {{ $t('admin.systemSettings.security.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('admin.systemSettings.security.description') }}
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
          {{ $t('admin.systemSettings.security.access') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.security.registrationEnabled')"
        >
          <el-switch v-model="localSettings.registrationEnabled" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.security.registrationEnabledHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.security.requireEmailVerification')"
        >
          <el-switch
            v-model="localSettings.requireEmailVerification"
            :disabled="!localSettings.registrationEnabled"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{
              $t('admin.systemSettings.security.requireEmailVerificationHelp')
            }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.security.allowGuestAccess')"
        >
          <el-switch v-model="localSettings.allowGuestAccess" />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.security.allowGuestAccessHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.security.defaultUserRole')"
          prop="defaultUserRole"
        >
          <el-select v-model="localSettings.defaultUserRole" class="w-full">
            <el-option value="user" :label="$t('roles.user')" />
            <el-option value="viewer" :label="$t('roles.viewer')" />
          </el-select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.security.defaultUserRoleHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.security.session') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.security.sessionTimeout')"
          prop="sessionTimeout"
        >
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="sessionTimeoutMinutes"
              :min="5"
              :max="10080"
              :step="5"
              @change="updateSessionTimeout"
            />
            <span class="text-gray-600 dark:text-gray-400">{{
              $t('common.minutes')
            }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.security.sessionTimeoutHelp') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('admin.systemSettings.security.maxLoginAttempts')"
          prop="maxLoginAttempts"
        >
          <el-input-number
            v-model="localSettings.maxLoginAttempts"
            :min="3"
            :max="10"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin.systemSettings.security.maxLoginAttemptsHelp') }}
          </p>
        </el-form-item>
      </div>

      <div class="form-section mb-8">
        <h4 class="form-section-title">
          {{ $t('admin.systemSettings.security.passwordPolicy') }}
        </h4>

        <el-form-item
          :label="$t('admin.systemSettings.security.minLength')"
          prop="passwordPolicy.minLength"
        >
          <el-input-number
            v-model="localSettings.passwordPolicy.minLength"
            :min="4"
            :max="32"
          />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item
            :label="$t('admin.systemSettings.security.requireUppercase')"
          >
            <el-switch
              v-model="localSettings.passwordPolicy.requireUppercase"
            />
          </el-form-item>

          <el-form-item
            :label="$t('admin.systemSettings.security.requireLowercase')"
          >
            <el-switch
              v-model="localSettings.passwordPolicy.requireLowercase"
            />
          </el-form-item>

          <el-form-item
            :label="$t('admin.systemSettings.security.requireNumbers')"
          >
            <el-switch v-model="localSettings.passwordPolicy.requireNumbers" />
          </el-form-item>

          <el-form-item
            :label="$t('admin.systemSettings.security.requireSpecialChars')"
          >
            <el-switch
              v-model="localSettings.passwordPolicy.requireSpecialChars"
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
import { ref, computed, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import type { SecuritySettings } from '../types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  settings: SecuritySettings;
}

interface Emits {
  (e: 'update', value: SecuritySettings): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const saving = ref(false);
const localSettings = ref<SecuritySettings>({ ...props.settings });

const sessionTimeoutMinutes = computed({
  get: () => Math.round(localSettings.value.sessionTimeout / 60),
  set: (minutes) => {
    localSettings.value.sessionTimeout = minutes * 60;
  },
});

const rules: FormRules = {
  defaultUserRole: [
    { required: true, message: t('validation.required'), trigger: 'change' },
  ],
  sessionTimeout: [
    {
      type: 'number',
      min: 300,
      message: t('validation.min', { min: 5 }),
      trigger: 'blur',
    },
  ],
  maxLoginAttempts: [
    {
      type: 'number',
      min: 3,
      max: 10,
      message: t('validation.range', { min: 3, max: 10 }),
      trigger: 'blur',
    },
  ],
  'passwordPolicy.minLength': [
    {
      type: 'number',
      min: 4,
      max: 32,
      message: t('validation.range', { min: 4, max: 32 }),
      trigger: 'blur',
    },
  ],
};

const updateSessionTimeout = (minutes: number | undefined) => {
  if (minutes !== undefined) {
    localSettings.value.sessionTimeout = minutes * 60;
    handleChange();
  }
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
        category: t('admin.systemSettings.tabs.security'),
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
.security-settings {
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
