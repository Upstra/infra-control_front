<template>
  <AuthCard>
    <AuthHeader
      :icon="headerIcon"
      :title="headerTitle"
      :description="headerDescription"
      :badge="willBeAdmin ? t('auth.register.admin_badge') : undefined"
    />

    <RegisterForm @success="onSuccess" @error="onError" />

    <div class="mt-8 text-center">
      <p class="text-sm text-gray-600">
        {{ t('auth.register.already_account') }}
        <router-link
          to="/login"
          class="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          {{ t('auth.register.login') }}
        </router-link>
      </p>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RegisterForm from '../components/RegisterForm.vue';
import AuthCard from '../components/AuthCard.vue';
import AuthHeader from '../components/AuthHeader.vue';
import { Rocket, UserPlus } from 'lucide-vue-next';
import { setupApi } from '@/features/setup/api';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const setupStatus = ref<{
  isFirstSetup?: boolean;
  hasAdminUser?: boolean;
} | null>(null);
onMounted(async () => {
  try {
    setupStatus.value = await setupApi.getPublicStatus();
  } catch (error) {
    console.error('Error checking setup status:', error);
    setupStatus.value = { isFirstSetup: false, hasAdminUser: true };
  }
});
const willBeAdmin = computed(() =>
  Boolean(setupStatus.value?.isFirstSetup && !setupStatus.value?.hasAdminUser),
);

const headerIcon = computed(() => (willBeAdmin.value ? Rocket : UserPlus));
const headerTitle = computed(() =>
  willBeAdmin.value ? t('auth.register.admin_title') : t('auth.register.title'),
);
const headerDescription = computed(() =>
  willBeAdmin.value
    ? t('auth.register.admin_description')
    : t('auth.register.description'),
);

function onSuccess() {
  if (willBeAdmin.value) {
    toast.success(t('toast.admin_created'));
    router.push('/setup/welcome');
  } else {
    toast.success(t('toast.registration_success'));
    router.push('/dashboard');
  }
}

function onError(message: string) {
  toast.error(message);
}
</script>

