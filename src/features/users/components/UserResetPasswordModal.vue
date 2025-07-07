<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import type { User } from '../types';
import { resetUserPassword } from '../api';
import { useAuthStore } from '@/features/auth/store';

interface Props {
  user: User | null;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  passwordReset: [];
}>();

const { t } = useI18n();
const authStore = useAuthStore();

const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref(false);

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value;
});

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 6 &&
    confirmPassword.value.length >= 6 &&
    passwordsMatch.value
  );
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    newPassword.value = '';
    confirmPassword.value = '';
    showPassword.value = false;
    showConfirmPassword.value = false;
    error.value = '';
    success.value = false;
  }
});

const generateRandomPassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  newPassword.value = password;
  confirmPassword.value = password;
  showPassword.value = true;
  showConfirmPassword.value = true;
};

const handleClose = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!props.user || !isFormValid.value) return;

  loading.value = true;
  error.value = '';

  try {
    await resetUserPassword(props.user.id, newPassword.value, authStore.token!);
    success.value = true;
    emit('passwordReset');
    setTimeout(() => {
      handleClose();
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || t('common.error_occurred');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <transition name="modal">
    <div
      v-if="isOpen && user"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="handleClose"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('users.reset_password') }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t('users.reset_password_for', { username: user.username }) }}
            </p>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <div
            v-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <p class="text-red-800 dark:text-red-200 text-sm">{{ error }}</p>
          </div>

          <div
            v-if="success"
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <p class="text-green-800 dark:text-green-200 text-sm">
              {{ t('users.password_reset_success') }}
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('users.new_password') }} *
              </label>
              <button
                type="button"
                @click="generateRandomPassword"
                class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {{ t('users.generate_password') }}
              </button>
            </div>
            <div class="relative">
              <input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :placeholder="t('users.new_password_placeholder')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ t('users.password_requirements') }}
            </p>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ t('users.confirm_password') }} *
            </label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :placeholder="t('users.confirm_password_placeholder')"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <p
              v-if="confirmPassword && !passwordsMatch"
              class="text-xs text-red-600 dark:text-red-400 mt-1"
            >
              {{ t('users.passwords_not_match') }}
            </p>
          </div>

          <div
            class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              type="button"
              @click="handleClose"
              :disabled="loading"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || loading || success"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="loading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ loading ? t('common.resetting') : t('users.reset_password') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>