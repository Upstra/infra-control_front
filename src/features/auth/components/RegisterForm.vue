<template>
  <div class="space-y-6">
    <GoogleButton :text="t('auth.form.google')" @click="handleOAuthGoogle" />

    <AuthDivider :text="t('auth.form.or')" />

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AuthInput
          id="firstName"
          type="text"
          :label="t('auth.form.firstname')"
          :placeholder="t('auth.form.firstname_placeholder')"
          v-model="form.firstName"
          required
        />
        <AuthInput
          id="lastName"
          type="text"
          :label="t('auth.form.lastname')"
          :placeholder="t('auth.form.lastname_placeholder')"
          v-model="form.lastName"
          required
        />
      </div>

      <AuthInput
        id="email"
        type="email"
        :label="t('auth.form.email')"
        :placeholder="
          t('auth.form.email_placeholder', { email: 'john@example.com' })
        "
        v-model="form.email"
        required
      />

      <AuthInput
        v-if="showConfirmEmail"
        id="confirmEmail"
        type="email"
        :label="t('auth.form.confirm_email')"
        :placeholder="t('auth.form.confirm_email_placeholder')"
        v-model="confirmEmail"
        :error="emailMismatch ? t('profile.password_mismatch') : undefined"
        :prevent-paste="true"
        :prevent-copy="true"
        required
      />

      <AuthInput
        id="username"
        type="text"
        :label="t('auth.form.username')"
        :placeholder="t('auth.form.username_placeholder')"
        v-model="form.username"
        required
      />

      <AuthInput
        id="password"
        :type="passwordFieldType"
        :label="t('auth.form.password')"
        :placeholder="t('auth.form.password_placeholder')"
        v-model="form.password"
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

      <AuthInput
        v-if="showConfirmPassword"
        id="confirmPassword"
        :type="confirmPasswordFieldType"
        :label="t('auth.form.confirm_password')"
        :placeholder="t('auth.form.confirm_password_placeholder')"
        v-model="confirmPassword"
        :error="passwordMismatch ? t('profile.password_mismatch') : undefined"
        :prevent-paste="true"
        :prevent-copy="true"
        required
      >
        <template #icon>
          <button
            type="button"
            tabindex="-1"
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            @click="toggleConfirmPasswordFieldType"
            :aria-label="t('auth.form.password_toggle')"
          >
            <component
              :is="confirmPasswordFieldType === 'password' ? Eye : EyeClosed"
              :size="20"
            />
          </button>
        </template>
      </AuthInput>

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
        :disabled="loading || emailMismatch || passwordMismatch"
        :loading="loading"
        :text="
          loading
            ? t('auth.form.submit_register_loading')
            : t('auth.form.submit_register')
        "
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../store';
import type { RegisterDto } from '../types';
import { useToast } from 'vue-toast-notification';
import { Eye, EyeClosed } from 'lucide-vue-next';
import { usePasswordToggle } from '../composables/usePasswordToggle';
import { useI18n } from 'vue-i18n';
import GoogleButton from './GoogleButton.vue';
import AuthDivider from './AuthDivider.vue';
import AuthInput from './AuthInput.vue';
import AuthButton from './AuthButton.vue';

const emit = defineEmits<{
  (e: 'success', payload: { token: string }): void;
  (e: 'error', message: string): void;
}>();

const toast = useToast();
const store = useAuthStore();
const { t } = useI18n();

const form = ref<RegisterDto>({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
});

const confirmEmail = ref('');
const confirmPassword = ref('');
const showConfirmEmail = ref(false);
const showConfirmPassword = ref(false);
const emailMismatch = ref(false);
const passwordMismatch = ref(false);

watch(
  () => form.value.email,
  (val) => {
    showConfirmEmail.value = val.length > 0;
  },
);
watch(
  () => form.value.password,
  (val) => {
    showConfirmPassword.value = val.length > 0;
  },
);

watch([() => form.value.email, confirmEmail], ([email, confirm]) => {
  emailMismatch.value = email !== confirm;
});
watch([() => form.value.password, confirmPassword], ([pwd, confirm]) => {
  passwordMismatch.value = pwd !== confirm;
});

const error = ref<string | null>(null);
const loading = ref(false);

const { fieldType: passwordFieldType, toggle: togglePasswordFieldType } =
  usePasswordToggle();
const {
  fieldType: confirmPasswordFieldType,
  toggle: toggleConfirmPasswordFieldType,
} = usePasswordToggle();

function handleOAuthGoogle() {
  toast.info(t('auth.form.oauth_unavailable'));
}

async function handleRegister() {
  error.value = null;
  if (emailMismatch.value || passwordMismatch.value) return;
  loading.value = true;
  try {
    await store.registerUser(form.value);
    let token = store.token;
    if (!token) throw new Error(t('errors.no_registration_token'));
    emit('success', { token });
  } catch (err: any) {
    const msg = err.response?.data?.message;
    const message = Array.isArray(msg)
      ? msg.join('\n')
      : msg || err.message || t('errors.unknown');
    error.value = message;
    emit('error', message);
  } finally {
    loading.value = false;
  }
}
</script>
