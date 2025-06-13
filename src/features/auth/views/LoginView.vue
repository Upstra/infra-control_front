<template>
  <div class="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-200">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-darker">Bienvenue sur Upstra</h1>
        <p class="text-sm text-neutral-dark mt-1">Connecte-toi pour accéder à ton espace de gestion</p>
      </div>

      <FirstInstallAlert v-if="isFirstInstall" />

      <LoginForm @success="onSuccess" @error="onError" />

      <p class="mt-6 text-sm text-center text-neutral-dark">
        Vous n’avez pas de compte ?
        <router-link to="/register"
          class="text-primary hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-primary">
          Inscrivez-vous
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import FirstInstallAlert from '../components/FirstInstallAlert.vue';
import { useAuthStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { setupApi } from '@/features/setup/api';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const isFirstInstall = ref(false);
onMounted(async () => {
  try {
    const status = await setupApi.getPublicStatus();
    isFirstInstall.value = Boolean(status.isFirstSetup && !status.hasAdminUser);
  } catch (error) {
    console.error('Erreur lors de la vérif du setup :', error);
  }
});

function onSuccess() {
  if (authStore.requiresTwoFactor) {
    toast.info('Code 2FA requis, veuillez le saisir.');
    router.push('/mfa-challenge');
  } else {
    toast.success('Connexion réussie');

    let setupStatus = setupApi.getAuthenticatedStatus();
    const skipSetup = localStorage.getItem("skipSetup");

    if (setupStatus.currentStep !== 'complete') {
      toast.info(skipSetup === 'true' ? 'Configuration ignorée' : 'Configuration requise');
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
