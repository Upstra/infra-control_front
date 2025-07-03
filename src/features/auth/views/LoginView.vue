<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <div class="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <LogIn class="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle class="text-2xl">{{ t('auth.login.title') }}</CardTitle>
        <CardDescription>{{ t('auth.login.description') }}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert v-if="isFirstInstall" class="mb-6">
          <AlertTitle>{{ t('auth.first_install.title') }}</AlertTitle>
          <AlertDescription>
            {{ t('auth.first_install.message') }}
          </AlertDescription>
        </Alert>

        <LoginForm @success="onSuccess" @error="onError" />
      </CardContent>

      <CardFooter>
        <p class="text-sm text-center w-full text-muted-foreground">
          {{ t('auth.login.no_account') }}
          <router-link
            to="/register"
            class="text-primary hover:underline font-medium"
          >
            {{ t('auth.login.signup') }}
          </router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import LoginForm from '../components/LoginForm.vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { setupApi } from '@/features/setup/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const { t } = useI18n();

const isFirstInstall = ref(false);
onMounted(async () => {
  try {
    const status = await setupApi.getPublicStatus();
    isFirstInstall.value = Boolean(status.isFirstSetup && !status.hasAdminUser);
  } catch (error) {
    console.error('Error checking setup:', error);
  }
});

async function onSuccess() {
  if (authStore.requiresTwoFactor) {
    toast.info(t('auth.messages.twofa_required'));
    router.push('/mfa-challenge');
  } else {
    toast.success(t('toast.login_success'));

    let setupStatus = await setupApi.getAuthenticatedStatus();
    const skipSetup = localStorage.getItem('skipSetup');

    if (setupStatus.currentStep !== 'complete') {
      toast.info(
        skipSetup === 'true'
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