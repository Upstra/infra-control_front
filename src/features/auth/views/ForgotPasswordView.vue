<template>
  <div
    class="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-900 sm:px-6 lg:px-8"
  >
    <AuthCard>
      <AuthHeader
        :title="$t('auth.forgotPassword.title')"
        :description="$t('auth.forgotPassword.description')"
        icon="mdi:email-lock-outline"
      />

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <AuthInput
          id="email"
          v-model="email"
          type="email"
          :label="$t('auth.fields.email')"
          :placeholder="$t('auth.forgotPassword.emailPlaceholder')"
          :hint="$t('auth.forgotPassword.emailHint')"
          required
          autofocus
          autocomplete="email"
          :error="errorMessage"
          :disabled="loading || success"
        />

        <div
          v-if="success"
          class="rounded-md bg-green-50 p-4 dark:bg-green-900/20"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircle class="h-5 w-5 text-green-400" :size="20" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800 dark:text-green-200">
                {{ $t('auth.forgotPassword.successMessage') }}
              </p>
            </div>
          </div>
        </div>

        <AuthButton
          type="submit"
          :loading="loading"
          :disabled="success"
          :text="$t('auth.forgotPassword.submitButton')"
        />

        <div class="text-center">
          <RouterLink
            to="/login"
            class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {{ $t('auth.forgotPassword.backToLogin') }}
          </RouterLink>
        </div>
      </form>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckCircle } from 'lucide-vue-next';
import AuthCard from '../components/AuthCard.vue';
import AuthHeader from '../components/AuthHeader.vue';
import AuthInput from '../components/AuthInput.vue';
import AuthButton from '../components/AuthButton.vue';
import { forgotPassword } from '../api';
import { useToast } from '@/shared/composables/useToast';

const { t } = useI18n();
const { showError } = useToast();

const email = ref('');
const loading = ref(false);
const success = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (!email.value || loading.value || success.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    await forgotPassword(email.value);
    success.value = true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      success.value = true;
    } else {
      errorMessage.value = t('auth.forgotPassword.errorGeneric');
      showError(t('auth.forgotPassword.errorGeneric'));
    }
  } finally {
    loading.value = false;
  }
};
</script>
