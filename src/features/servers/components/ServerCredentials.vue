<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  KeyIcon,
  UserIcon,
} from '@heroicons/vue/24/outline';
import { CheckIcon } from '@heroicons/vue/24/solid';
import { useToast } from 'vue-toast-notification';

interface Props {
  login?: string;
  password?: string;
}

const props = defineProps<Props>();
const { t } = useI18n();
const toast = useToast();

const showPassword = ref(false);
const copiedField = ref<'login' | 'password' | null>(null);

const maskedPassword = computed(() => {
  if (!props.password) return '';
  return showPassword.value ? props.password : '••••••••';
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const copyToClipboard = async (field: 'login' | 'password') => {
  const value = field === 'login' ? props.login : props.password;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copiedField.value = field;
    toast.success(
      t('servers.credentials.copied', {
        field: t(`servers.credentials.${field}`),
      }),
    );

    setTimeout(() => {
      copiedField.value = null;
    }, 2000);
  } catch (error) {
    toast.error(t('servers.credentials.copy_error'));
  }
};
</script>

<template>
  <div
    class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center gap-2 mb-3">
      <KeyIcon class="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ t('servers.credentials.title') }}
      </h3>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UserIcon class="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('servers.credentials.login') }}:
          </span>
          <span class="text-sm font-mono text-gray-900 dark:text-white">
            {{ login || t('servers.credentials.not_configured') }}
          </span>
        </div>
        <button
          v-if="login"
          @click="copyToClipboard('login')"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          :title="t('servers.credentials.copy')"
        >
          <component
            :is="copiedField === 'login' ? CheckIcon : ClipboardDocumentIcon"
            class="h-4 w-4"
            :class="[
              copiedField === 'login'
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400',
            ]"
          />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <KeyIcon class="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('servers.credentials.password') }}:
          </span>
          <span class="text-sm font-mono text-gray-900 dark:text-white">
            {{
              password
                ? maskedPassword
                : t('servers.credentials.not_configured')
            }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <button
            v-if="password"
            @click="togglePasswordVisibility"
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            :title="
              showPassword
                ? t('servers.credentials.hide')
                : t('servers.credentials.show')
            "
          >
            <component
              :is="showPassword ? EyeSlashIcon : EyeIcon"
              class="h-4 w-4 text-gray-500 dark:text-gray-400"
            />
          </button>
          <button
            v-if="password"
            @click="copyToClipboard('password')"
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            :title="t('servers.credentials.copy')"
          >
            <component
              :is="
                copiedField === 'password' ? CheckIcon : ClipboardDocumentIcon
              "
              class="h-4 w-4"
              :class="[
                copiedField === 'password'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="login && password"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ t('servers.credentials.auto_fill_info') }}
      </p>
    </div>
  </div>
</template>
