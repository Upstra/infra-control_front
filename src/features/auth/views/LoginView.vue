<template>
  <AuthCard>
    <AuthHeader
      :icon="LogIn"
      :title="t('auth.login.title')"
      :description="t('auth.login.description')"
    />

    <FirstInstallAlert v-if="isFirstInstall" />

    <LoginForm @success="onSuccess" @error="onError" />

    <div class="mt-8 text-center">
      <p class="text-sm text-gray-600">
        {{ t('auth.login.no_account') }}
        <router-link
          to="/register"
          class="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          {{ t('auth.login.signup') }}
        </router-link>
      </p>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import LoginForm from '../components/LoginForm.vue';
import FirstInstallAlert from '../components/FirstInstallAlert.vue';
import AuthCard from '../components/AuthCard.vue';
import AuthHeader from '../components/AuthHeader.vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { setupApi } from '@/features/setup/api';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const { t } = useI18n();

const isFirstInstall = ref(false);
onMounted(async () => {
  try {
    const status = await setupApi.getPublicStatus();
    isFirstInstall.value = Boolean(status.isFirstSetup && !status.hasAdminUser);
  } catch (error) {}
});

async function onSuccess() {
  if (authStore.requiresTwoFactor) {
    toast.info(t('auth.messages.twofa_required'));
    router.push('/mfa-challenge');
  } else {
    toast.success(t('toast.login_success'));

    let setupStatus = await setupApi.getAuthenticatedStatus();
    // Check both keys for backward compatibility
    const skipSetup = localStorage.getItem('skipSetup') === 'true' || 
                     localStorage.getItem('setup_skipped') === 'true';

    if (setupStatus.currentStep !== 'complete') {
      toast.info(
        skipSetup
          ? t('auth.messages.setup_skipped')
          : t('auth.messages.setup_required'),
      );
      router.push('/setup');
      return;
    }

    router.push('/dashboard');
  }
}

function onError(message: string) {
  toast.error(message);
}
</script>
