<template>
  <div
    class="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-900 sm:px-6 lg:px-8"
  >
    <AuthCard>
      <AuthHeader
        :title="$t('auth.resetPassword.title')"
        :description="$t('auth.resetPassword.description')"
        :icon="KeyRound"
      />

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <AuthInput
          id="password"
          ref="passwordInput"
          v-model="password"
          :type="passwordFieldType"
          :label="$t('auth.fields.newPassword')"
          :placeholder="$t('auth.resetPassword.passwordPlaceholder')"
          required
          autofocus
          autocomplete="new-password"
          :error="errors.password"
          :disabled="loading"
          @paste.prevent
        >
          <template #icon>
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="focus:outline-none"
              :aria-label="
                passwordFieldType === 'password'
                  ? $t('auth.showPassword')
                  : $t('auth.hidePassword')
              "
            >
              <component
                :is="passwordFieldType === 'password' ? Eye : EyeOff"
                class="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                :size="20"
              />
            </button>
          </template>
        </AuthInput>

        <AuthInput
          id="confirmPassword"
          v-model="confirmPassword"
          :type="confirmPasswordFieldType"
          :label="$t('auth.fields.confirmPassword')"
          :placeholder="$t('auth.resetPassword.confirmPasswordPlaceholder')"
          required
          autocomplete="new-password"
          :error="errors.confirmPassword"
          :disabled="loading"
          @paste.prevent
        >
          <template #icon>
            <button
              type="button"
              @click="toggleConfirmPasswordVisibility"
              class="focus:outline-none"
              :aria-label="
                confirmPasswordFieldType === 'password'
                  ? $t('auth.showPassword')
                  : $t('auth.hidePassword')
              "
            >
              <component
                :is="confirmPasswordFieldType === 'password' ? Eye : EyeOff"
                class="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                :size="20"
              />
            </button>
          </template>
        </AuthInput>

        <div
          v-if="tokenError"
          class="rounded-md bg-red-50 p-4 dark:bg-red-900/20"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-5 w-5 text-red-400" :size="20" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ $t('auth.resetPassword.tokenError') }}
              </p>
            </div>
          </div>
        </div>

        <AuthButton
          type="submit"
          :loading="loading"
          :disabled="tokenError"
          :text="$t('auth.resetPassword.submitButton')"
        />

        <div class="text-center">
          <RouterLink
            to="/login"
            class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {{ $t('auth.resetPassword.backToLogin') }}
          </RouterLink>
        </div>
      </form>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AlertTriangle, Eye, EyeOff, KeyRound } from 'lucide-vue-next';
import AuthCard from '../components/AuthCard.vue';
import AuthHeader from '../components/AuthHeader.vue';
import AuthInput from '../components/AuthInput.vue';
import AuthButton from '../components/AuthButton.vue';
import { resetPasswordWithToken } from '../api';
import { useToast } from '@/shared/composables/useToast';
import { usePasswordToggle } from '../composables/usePasswordToggle';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useToast();

const passwordInput = ref<InstanceType<typeof AuthInput>>();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const tokenError = ref(false);
const errors = reactive({
  password: '',
  confirmPassword: '',
});

const { fieldType: passwordFieldType, toggle: togglePasswordVisibility } =
  usePasswordToggle();
const {
  fieldType: confirmPasswordFieldType,
  toggle: toggleConfirmPasswordVisibility,
} = usePasswordToggle();

const token = route.query.token as string;

onMounted(() => {
  if (!token) {
    tokenError.value = true;
  }
});

const validateForm = (): boolean => {
  errors.password = '';
  errors.confirmPassword = '';

  if (password.value.length < 8) {
    errors.password = t('auth.validation.passwordTooShort');
    return false;
  }

  if (!/(?=.*[a-z])/.test(password.value)) {
    errors.password = t('auth.validation.passwordMissingLowercase');
    return false;
  }

  if (!/(?=.*[A-Z])/.test(password.value)) {
    errors.password = t('auth.validation.passwordMissingUppercase');
    return false;
  }

  if (!/(?=.*\d)/.test(password.value)) {
    errors.password = t('auth.validation.passwordMissingNumber');
    return false;
  }

  if (!/(?=.*[@$!%*?&])/.test(password.value)) {
    errors.password = t('auth.validation.passwordMissingSymbol');
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = t('auth.validation.passwordsDoNotMatch');
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm() || loading.value || tokenError.value) return;

  loading.value = true;

  try {
    await resetPasswordWithToken(token, password.value);
    showSuccess(t('auth.resetPassword.successMessage'));
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      tokenError.value = true;
    } else {
      showError(t('auth.resetPassword.errorGeneric'));
    }
  } finally {
    loading.value = false;
  }
};
</script>
