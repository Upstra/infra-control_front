<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-8 text-center">
      <h1
        class="text-3xl md:text-4xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup.welcome_title') }}
        <span class="inline-block animate-bounce">🚀</span>
      </h1>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
        {{ t('setup.welcome_desc') }}
      </p>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-10"
    >
      <div
        class="flex flex-col items-center bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100 dark:border-neutral-700"
      >
        <div class="bg-primary/10 dark:bg-primary/20 rounded-full p-3 mb-4">
          <Building2 :size="32" class="text-primary" />
        </div>
        <h3 class="text-base font-semibold text-neutral-darker dark:text-white mb-1">
          {{ t('setup.step_rooms_title') }}
        </h3>
        <p class="text-sm text-neutral dark:text-neutral-400 text-center">
          {{ t('setup.step_rooms_desc') }}
        </p>
      </div>
      <div
        class="flex flex-col items-center bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100 dark:border-neutral-700"
      >
        <div class="bg-primary/10 dark:bg-primary/20 rounded-full p-3 mb-4">
          <BatteryCharging :size="32" class="text-primary" />
        </div>
        <h3 class="text-base font-semibold text-neutral-darker dark:text-white mb-1">
          {{ t('setup.step_ups_title') }}
        </h3>
        <p class="text-sm text-neutral dark:text-neutral-400 text-center">
          {{ t('setup.step_ups_desc') }}
        </p>
      </div>
      <div
        class="flex flex-col items-center bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100 dark:border-neutral-700"
      >
        <div class="bg-primary/10 dark:bg-primary/20 rounded-full p-3 mb-4">
          <Server :size="32" class="text-primary" />
        </div>
        <h3 class="text-base font-semibold text-neutral-darker dark:text-white mb-1">
          {{ t('setup.step_servers_title') }}
        </h3>
        <p class="text-sm text-neutral dark:text-neutral-400 text-center">
          {{ t('setup.step_servers_desc') }}
        </p>
      </div>
      <div
        class="flex flex-col items-center bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100 dark:border-neutral-700"
      >
        <div class="bg-primary/10 dark:bg-primary/20 rounded-full p-3 mb-4">
          <Users :size="32" class="text-primary" />
        </div>
        <h3 class="text-base font-semibold text-neutral-darker dark:text-white mb-1">
          {{ t('setup.step_team_title') }}
        </h3>
        <p class="text-sm text-neutral dark:text-neutral-400 text-center">
          {{ t('setup.step_team_desc') }}
        </p>
      </div>
    </div>

    <div
      class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg px-4 py-3 mb-8 w-full max-w-lg"
    >
      <Info :size="20" class="text-primary-dark dark:text-primary" />
      <p class="text-sm text-neutral-dark dark:text-neutral-300" v-html="t('setup.info')"></p>
    </div>

    <button
      v-if="setupStore.setupStatus?.currentStep === SetupStep.WELCOME"
      type="button"
      @click="handleWelcomeNext"
      class="inline-flex items-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95"
      :aria-label="t('setup.next_step_aria')"
    >
      <Building2 :size="20" />
      {{ t('setup.start_button') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  Building2,
  BatteryCharging,
  Server,
  Users,
  Info,
} from 'lucide-vue-next';

import { useSetupStore } from '@/features/setup/store';
import { SetupStep } from '@/features/setup/types';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

const setupStore = useSetupStore();
const { t } = useI18n();
onMounted(() => {
  if (!setupStore.setupStatus) setupStore.checkSetupStatus();
});
async function handleWelcomeNext() {
  await setupStore.completeSetupStep(SetupStep.WELCOME);
}
</script>
