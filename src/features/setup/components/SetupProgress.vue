<template>
  <div class="relative">
    <div
      class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            >
              <Rocket class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                class="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
              >
                {{ $t('setup.title') }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getCurrentStepLabel() }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-6">
            <div class="text-right">
              <p
                class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {{ Math.round(progressPercentage) }}%
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{
                  $t('setup.progress_step', {
                    current: currentStepIndex + 1,
                    total: totalSteps,
                  })
                }}
              </p>
            </div>

            <div class="flex items-center space-x-3">
              <button
                @click="showRestartDialog = true"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                {{ $t('setup.restart.button') }}
              </button>

              <button
                v-if="canSkip"
                @click="$emit('skip')"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <SkipForward class="w-4 h-4 mr-2" />
                {{ $t('setup.skip_button_short') }}
              </button>
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"
          ></div>
          <div
            class="relative overflow-hidden h-3 bg-gray-200 dark:bg-gray-800 rounded-full"
          >
            <div
              class="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            >
              <div
                class="absolute inset-0 bg-white/30 animate-shimmer"
                style="
                  background-image: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.4),
                    transparent
                  );
                  background-size: 200% 100%;
                "
              ></div>
            </div>
          </div>

          <div class="absolute -bottom-1 left-0 right-0">
            <div
              v-for="(step, index) in steps"
              :key="step.key"
              class="absolute"
              :style="{
                left:
                  index === 0
                    ? '0'
                    : index === steps.length - 1
                      ? 'auto'
                      : `${(index / (steps.length - 1)) * 100}%`,
                right: index === steps.length - 1 ? '0' : 'auto',
                transform:
                  index === 0 || index === steps.length - 1
                    ? 'none'
                    : 'translateX(-50%)',
              }"
            >
              <div
                :class="[
                  'w-6 h-6 rounded-full border-2 transition-all duration-300',
                  index <= currentStepIndex
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent shadow-lg shadow-purple-500/30'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700',
                ]"
              >
                <div
                  v-if="index < currentStepIndex"
                  class="w-full h-full flex items-center justify-center"
                >
                  <Check class="w-3 h-3 text-white" />
                </div>
                <div
                  v-else-if="index === currentStepIndex"
                  class="w-full h-full flex items-center justify-center"
                >
                  <div
                    class="w-2 h-2 bg-white rounded-full animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          <div
            v-for="(step, index) in steps"
            :key="step.key"
            :class="[
              'relative px-3 py-2 rounded-lg text-xs font-medium text-center transition-all duration-300',
              index === currentStepIndex
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                : index < currentStepIndex
                  ? step.key === 'welcome'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed opacity-60'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60',
            ]"
            @click="handleStepClick(step.key, index)"
          >
            <div class="flex items-center justify-center space-x-1">
              <component :is="step.icon" class="w-3.5 h-3.5" />
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="h-40"></div>

    <!-- Restart Setup Modal -->
    <RestartSetupDialog
      :isOpen="showRestartDialog"
      @close="showRestartDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Rocket,
  Check,
  SkipForward,
  Home,
  Package,
  Server,
  Cpu,
  CheckCircle,
  LayoutTemplate,
  Settings,
  FileCheck,
} from 'lucide-vue-next';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import RestartSetupDialog from '@/features/setup/components/dialogs/RestartSetupDialog.vue';
import type { SetupStatus } from '../types';

interface Props {
  setupStatus: SetupStatus;
  canSkip?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  skip: [];
  'go-to-step': [step: string];
}>();

const { t } = useI18n();

const showRestartDialog = ref(false);

const steps = computed(() => [
  { key: 'welcome', label: t('setup.steps.welcome'), icon: Home },
  { key: 'planning', label: t('setup.steps.planning'), icon: LayoutTemplate },
  { key: 'rooms', label: t('setup.steps.rooms'), icon: Package },
  { key: 'ups', label: t('setup.steps.ups'), icon: Server },
  { key: 'servers', label: t('setup.steps.servers'), icon: Cpu },
  {
    key: 'relationships',
    label: t('setup.steps.relationships'),
    icon: Settings,
  },
  { key: 'review', label: t('setup.steps.review'), icon: FileCheck },
  { key: 'complete', label: t('setup.steps.complete'), icon: CheckCircle },
]);

const currentStepIndex = computed(() => props.setupStatus.currentStepIndex);
const totalSteps = computed(() => props.setupStatus.totalSteps);

const progressPercentage = computed(() => {
  if (!props.setupStatus) return 0;
  return ((currentStepIndex.value + 1) / totalSteps.value) * 100;
});

const getCurrentStepLabel = () => {
  const step = steps.value[currentStepIndex.value];
  return step ? step.label : '';
};

const handleStepClick = (stepKey: string, index: number) => {
  if (index === currentStepIndex.value) {
    emit('go-to-step', stepKey);
  } else if (index < currentStepIndex.value && stepKey === 'welcome') {
    emit('go-to-step', stepKey);
  }
};
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.animate-shimmer {
  animation: shimmer 3s linear infinite;
}
</style>
