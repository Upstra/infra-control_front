<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
  >
    <div
      class="fixed inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
    ></div>

    <SetupProgress
      v-if="
        setupStore.setupStatus &&
        setupStore.setupStatus.currentStep !== 'welcome'
      "
      :setup-status="setupStore.setupStatus"
      :can-skip="canSkipStep"
      @skip="skipToLater"
      @go-to-step="goToStep"
    />

    <div class="relative">
      <router-view v-slot="{ Component, route }">
        <transition
          name="page-transition"
          mode="out-in"
          @before-enter="beforeEnter"
          @enter="enter"
          @leave="leave"
        >
          <component
            :is="Component"
            :is-read-only="isReadOnly(route.params.step as string)"
          />
        </transition>
      </router-view>
    </div>

    <div
      v-if="setupStore.isLoading"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"
            ></div>
            <div
              class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"
            ></div>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">
            {{ $t('setup.loading') }}
          </p>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 pointer-events-none">
      <div class="relative h-96">
        <div
          class="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSetupStore } from '../store';
import { SetupStep } from '../types';
import SetupProgress from '../components/SetupProgress.vue';
import { skipSetupAndCleanup } from '../utils/cleanup';

const router = useRouter();
const setupStore = useSetupStore();

const canSkipStep = computed(() => {
  const currentStep = setupStore.setupStatus?.currentStep;
  return currentStep !== SetupStep.REVIEW && currentStep !== SetupStep.COMPLETE;
});

onMounted(async () => {
  await setupStore.checkSetupStatus();
});

const skipToLater = () => {
  // Utiliser l'utilitaire pour skip et nettoyer
  skipSetupAndCleanup();
  setupStore.resetSetup();
  router.push('/dashboard');
};

const goToStep = async (step: string) => {
  // Pas besoin de mapper, on utilise directement le paramètre step comme route
  await router.push(`/setup/${step}`);
};

const isReadOnly = (currentRouteStep: string) => {
  if (!setupStore.setupStatus) return false;

  const stepOrder: Record<string, number> = {
    welcome: 0,
    planning: 1,
    rooms: 2,
    ups: 3,
    servers: 4,
    relationships: 5,
    review: 6,
    complete: 7,
    'create-room': 2,
    'create-ups': 3,
    'create-server': 4,
  };

  const currentStepIndex = setupStore.setupStatus.currentStepIndex;
  const routeStepIndex = stepOrder[currentRouteStep] ?? -1;

  return routeStepIndex >= 0 && routeStepIndex < currentStepIndex;
};

const beforeEnter = (el: any) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
};

const enter = (el: any, done: any) => {
  el.style.transition = 'all 0.5s ease-out';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  setTimeout(done, 500);
};

const leave = (el: any, done: any) => {
  el.style.transition = 'all 0.3s ease-in';
  el.style.opacity = '0';
  el.style.transform = 'translateY(-30px)';
  setTimeout(done, 300);
};
</script>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-gradient(currentColor 1px, transparent 1px),
    linear-gradient(90deg, currentColor 1px, transparent 1px);
  background-size: 40px 40px;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
