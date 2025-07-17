<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-5xl w-full">
      <div class="text-center mb-12 animate-fade-in">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-purple-500/30 mb-6"
        >
          <Rocket class="w-10 h-10 text-white animate-bounce" />
        </div>

        <h1
          class="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4"
        >
          {{ t('setup.welcome_title') }}
        </h1>
        <p
          class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          {{ t('setup.welcome_desc') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-500 animate-slide-up"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>

          <div class="relative">
            <div
              :class="[
                'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4',
                feature.bgClass,
              ]"
            >
              <component
                :is="feature.icon"
                class="w-7 h-7"
                :class="feature.iconClass"
              />
            </div>

            <h3
              class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
            >
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ feature.description }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in feature.tags"
                :key="tag"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 mb-10 border border-blue-100 dark:border-gray-700 animate-fade-in"
        style="animation-delay: 400ms"
      >
        <div class="flex items-start space-x-4">
          <div
            class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Sparkles class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              {{ t('setup.info_title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{
                t('setup.info', {
                  minutes: '5',
                  additional_info: $t('setup.info_additional'),
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="text-center">
        <div
          v-if="!props.isReadOnly"
          class="flex flex-col items-center space-y-4"
        >
          <button
            @click="handleWelcomeNext"
            class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 animate-pulse-slow"
          >
            <span>{{ t('setup.start_button') }}</span>
            <ArrowRight
              class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
            />
          </button>

          <button
            @click="handleSkipSetup"
            class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            <X class="mr-2 w-4 h-4" />
            <span>{{ t('setup.skip_button_full') }}</span>
          </button>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('setup.start_time_estimate') }}
          </p>
        </div>

        <div v-else class="text-sm text-neutral-500 dark:text-neutral-400">
          <Info :size="16" class="inline mr-2" />
          {{ t('setup.read_only_message') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Rocket,
  ArrowRight,
  Sparkles,
  Building2,
  Server,
  Shield,
  Zap,
  Info,
  X,
} from 'lucide-vue-next';
import { useSetupStore } from '@/features/setup/store';
import { SetupStep } from '@/features/setup/types';

const setupStore = useSetupStore();
const { t } = useI18n();
import { useRouter } from 'vue-router';
const router = useRouter();

interface Props {
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
});

const features = computed(() => [
  {
    icon: Building2,
    title: t('setup.feature_rooms_title'),
    description: t('setup.feature_rooms_desc'),
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconClass: 'text-blue-600 dark:text-blue-400',
    tags: [t('setup.tag_organization'), t('setup.tag_structure')],
  },
  {
    icon: Server,
    title: t('setup.feature_servers_title'),
    description: t('setup.feature_servers_desc'),
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    iconClass: 'text-purple-600 dark:text-purple-400',
    tags: [t('setup.tag_monitoring'), t('setup.tag_control')],
  },
  {
    icon: Zap,
    title: t('setup.feature_ups_title'),
    description: t('setup.feature_ups_desc'),
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    iconClass: 'text-green-600 dark:text-green-400',
    tags: [t('setup.tag_power'), t('setup.tag_backup')],
  },
  {
    icon: Shield,
    title: t('setup.feature_security_title'),
    description: t('setup.feature_security_desc'),
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    iconClass: 'text-red-600 dark:text-red-400',
    tags: [t('setup.tag_rbac'), t('setup.tag_2fa')],
  },
]);

function getStepRoute(step: SetupStep): string {
  const stepToRoute: Record<SetupStep, string> = {
    [SetupStep.WELCOME]: 'welcome',
    [SetupStep.RESOURCE_PLANNING]: 'planning',
    [SetupStep.ROOMS_CONFIG]: 'rooms',
    [SetupStep.UPS_CONFIG]: 'ups',
    [SetupStep.SERVERS_CONFIG]: 'servers',
    [SetupStep.RELATIONSHIPS]: 'relationships',
    [SetupStep.REVIEW]: 'review',
    [SetupStep.COMPLETE]: 'complete',
    [SetupStep.CREATE_ROOM]: 'create-room',
    [SetupStep.CREATE_UPS]: 'create-ups',
    [SetupStep.CREATE_SERVER]: 'create-server',
    [SetupStep.VM_DISCOVERY]: 'vm-discovery',
  };

  const route = stepToRoute[step];
  return route ? `/setup/${route}` : '/setup/welcome';
}

function redirectToCurrentStep() {
  const currentStep = setupStore.setupStatus?.currentStep;
  if (!currentStep) return;
  router.push(getStepRoute(currentStep));
}

onMounted(() => {
  if (!setupStore.setupStatus) {
    setupStore.checkSetupStatus();
  }
});

async function handleWelcomeNext() {
  // S'assurer que le status est initialisé
  if (!setupStore.setupStatus) {
    setupStore.initializeLocalSetupStatus(SetupStep.WELCOME);
  }

  if (setupStore.setupStatus?.currentStep === SetupStep.WELCOME) {
    await setupStore.goToNextStep();
  } else {
    redirectToCurrentStep();
  }
}

async function handleSkipSetup() {
  // Marquer le setup comme complété sans configurer les ressources
  await setupStore.skipSetup();
  // Rediriger vers le dashboard
  router.push('/dashboard');
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>
