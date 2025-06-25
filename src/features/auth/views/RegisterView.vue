<template>
  <div class="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-200">
      <div class="text-center mb-8">
        <component :is="headerIcon" :size="48" :class="headerIconClass" />
        <h1 class="text-3xl font-bold text-neutral-darker">{{ headerTitle }}</h1>
        <p class="text-sm text-neutral-dark mt-1">{{ headerDescription }}</p>
      </div>

      <div v-if="willBeAdmin" class="admin-badge mb-6">
        <Shield :size="20" />
        <span>Vous serez administrateur</span>
      </div>

      <RegisterForm @success="onSuccess" @error="onError" />

      <p class="mt-6 text-sm text-center text-neutral-dark">
        Déjà un compte ?
        <router-link to="/login" class="text-primary hover:underline font-medium">
          Connectez-vous
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RegisterForm from '../components/RegisterForm.vue';
import { Rocket, UserPlus, Shield } from 'lucide-vue-next';
import { setupApi } from '@/features/setup/api';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const setupStatus = ref<{ isFirstSetup?: boolean; hasAdminUser?: boolean } | null>(null);
onMounted(async () => {
  try {
    setupStatus.value = await setupApi.getPublicStatus();
  } catch (error) {
    console.error('Error checking setup status:', error);
    setupStatus.value = { isFirstSetup: false, hasAdminUser: true };
  }
});
const willBeAdmin = computed(() =>
  Boolean(setupStatus.value?.isFirstSetup && !setupStatus.value?.hasAdminUser)
);

const headerIcon = computed(() => (willBeAdmin.value ? Rocket : UserPlus));
const headerIconClass = computed(() => (willBeAdmin.value ? 'icon-admin' : 'icon-user'));
const headerTitle = computed(() =>
  willBeAdmin.value ? 'Créez le compte administrateur' : 'Créer un compte'
);
const headerDescription = computed(() =>
  willBeAdmin.value
    ? 'Configurez le premier administrateur de votre infrastructure'
    : 'Rejoignez votre équipe sur Upstra'
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

<style scoped>
.icon-admin {
  color: #2563eb;
  animation: bounce 2s infinite;
}

.icon-user {
  color: #6b7280;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

</style>
