<template>
  <div class="space-y-6">
    <GoogleButton :text="t('auth.form.google')" @click="handleOAuthGoogle" />

    <AuthDivider :text="t('auth.form.or')" />

    <form @submit.prevent="handleLogin" class="space-y-5">
      <AuthInput
        id="identifier"
        type="text"
        :label="t('auth.form.identifier')"
        :placeholder="
          t('auth.form.identifier_placeholder', {
            email: 'john.doe@example.com',
          })
        "
        v-model="identifier"
        @enter="switchToPassword"
        required
      />

      <div>
        <AuthInput
          id="password"
          ref="passwordInput"
          :type="passwordFieldType"
          :label="t('auth.form.password')"
          placeholder="••••••••"
          v-model="password"
          @enter="handleLogin"
          required
        >
          <template #icon>
            <button
              type="button"
              tabindex="-1"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="togglePasswordFieldType"
              :aria-label="t('auth.form.password_toggle')"
            >
              <component
                :is="passwordFieldType === 'password' ? Eye : EyeClosed"
                :size="20"
              />
            </button>
          </template>
        </AuthInput>
        <div class="flex justify-end mt-2">
          <a
            href="#"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            {{ t('auth.form.forgot_password') }}
          </a>
        </div>
      </div>

      <div
        v-if="error"
        class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <p class="text-sm text-red-600 dark:text-red-400 text-center">
          {{ error }}
        </p>
      </div>

      <AuthButton
        type="submit"
        variant="primary"
        :disabled="loading"
        :loading="loading"
        :text="
          loading
            ? t('auth.form.submit_login_loading')
            : t('auth.form.submit_login')
        "
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { Eye, EyeClosed } from 'lucide-vue-next';
import { usePasswordToggle } from '../composables/usePasswordToggle';
import { useI18n } from 'vue-i18n';
import GoogleButton from './GoogleButton.vue';
import AuthDivider from './AuthDivider.vue';
import AuthInput from './AuthInput.vue';
import AuthButton from './AuthButton.vue';

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();
const { t } = useI18n();

const identifier = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const { fieldType: passwordFieldType, toggle: togglePasswordFieldType } =
  usePasswordToggle();
usePasswordToggle();

const passwordInput = ref<HTMLInputElement | null>(null);

function handleOAuthGoogle() {
  toast.info(t('auth.form.oauth_unavailable'));
}

async function handleLogin() {
  error.value = null;
  loading.value = true;
  try {
    await store.loginUser({
      identifier: identifier.value,
      password: password.value,
    });
    emit('success');
  } catch (err: any) {
    const message = err.message || t('errors.unknown');
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}

const switchToPassword = () => {
  passwordInput.value?.focus();
};
</script>
