<template>
  <div
    class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10"
  >
    <div class="mb-6">
      <CheckCircle
        :size="64"
        class="text-success animate-[scaleIn_0.5s_ease-out] drop-shadow-lg"
      />
    </div>

    <h1
      class="text-3xl md:text-4xl font-bold text-neutral-darker dark:text-white mb-2 tracking-tight"
    >
      {{ t('setup_complete.title') }}
      <span class="inline-block animate-bounce">🎉</span>
    </h1>
    <p
      class="mb-10 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-xl text-center"
      v-html="t('setup_complete.description')"
    />

    <div v-if="isLoading" class="w-full max-w-2xl mb-10">
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow border border-neutral-100 dark:border-neutral-700 p-6"
      >
        <div class="animate-pulse">
          <div
            class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"
          ></div>
          <div class="space-y-3">
            <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="w-full max-w-2xl mb-10 bg-white dark:bg-neutral-800 rounded-2xl shadow border border-neutral-100 dark:border-neutral-700 p-6 flex flex-col gap-4"
    >
      <h3
        class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
      >
        {{ t('setup_complete.summary_title') }}
      </h3>
      <div class="divide-y divide-neutral-100 dark:divide-neutral-700">
        <div class="flex items-center gap-3 py-3">
          <Building2 :size="22" class="text-primary" />
          <div class="flex-1">
            <span class="font-medium text-neutral-dark dark:text-neutral-300">{{
              t('setup_complete.room_created')
            }}</span>
            <span class="ml-2 text-neutral dark:text-neutral-400">{{
              configSummary.roomName
            }}</span>
            <span
              v-if="configSummary.roomLocation"
              class="ml-2 text-sm text-neutral/70 dark:text-neutral-500"
            >
              ({{ configSummary.roomLocation }})
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3 py-3">
          <BatteryCharging :size="22" class="text-primary" />
          <div class="flex-1">
            <span class="font-medium text-neutral-dark dark:text-neutral-300">{{
              t('setup_complete.ups_added')
            }}</span>
            <span class="ml-2 text-neutral dark:text-neutral-400">{{
              configSummary.upsName
            }}</span>
            <span
              v-if="configSummary.upsCapacity"
              class="ml-2 text-sm text-neutral/70 dark:text-neutral-500"
            >
              ({{ configSummary.upsCapacity }} kVA)
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3 py-3">
          <Server :size="22" class="text-primary" />
          <div class="flex-1">
            <span class="font-medium text-neutral-dark dark:text-neutral-300">{{
              t('setup_complete.server_configured')
            }}</span>
            <span class="ml-2 text-neutral dark:text-neutral-400">{{
              configSummary.serverName
            }}</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm text-neutral/70 dark:text-neutral-500">
                IP: {{ configSummary.serverIp }}
              </span>
              <span class="text-sm text-neutral/70 dark:text-neutral-500"
                >•</span
              >
              <span class="text-sm text-neutral/70 dark:text-neutral-500">
                Type:
                {{
                  configSummary.serverType === 'physical'
                    ? t('setup_complete.type_physical')
                    : t('setup_complete.type_virtual')
                }}
              </span>
              <span class="text-sm text-neutral/70 dark:text-neutral-500"
                >•</span
              >
              <span
                :class="[
                  'text-sm font-medium',
                  configSummary.serverState === 'active'
                    ? 'text-success'
                    : 'text-neutral',
                ]"
              >
                {{
                  configSummary.serverState === 'active'
                    ? t('setup_complete.state_active')
                    : t('setup_complete.state_inactive')
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="fetchError"
        class="mt-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg"
      >
        <AlertTriangle :size="16" class="inline mr-1" />
        {{ t('setup_complete.fetch_error') }}
      </div>
    </div>

    <div class="w-full max-w-3xl mb-10">
      <h3
        class="text-lg font-semibold text-neutral-darker dark:text-white mb-4"
      >
        {{ t('setup_complete.next_steps_title') }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          class="flex flex-col items-center bg-primary/5 dark:bg-primary/10 rounded-xl p-5 text-center shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-lg transition"
        >
          <Users :size="28" class="text-primary mb-2" />
          <h4
            class="text-base font-semibold text-neutral-dark dark:text-neutral-300 mb-1"
          >
            {{ t('setup_complete.invite_team_title') }}
          </h4>
          <p class="text-sm text-neutral dark:text-neutral-400">
            {{ t('setup_complete.invite_team_text') }}
          </p>
        </div>
        <div
          class="flex flex-col items-center bg-primary/5 dark:bg-primary/10 rounded-xl p-5 text-center shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-lg transition"
        >
          <Plus :size="28" class="text-primary mb-2" />
          <h4
            class="text-base font-semibold text-neutral-dark dark:text-neutral-300 mb-1"
          >
            {{ t('setup_complete.add_equipment_title') }}
          </h4>
          <p class="text-sm text-neutral dark:text-neutral-400">
            {{ t('setup_complete.add_equipment_text') }}
          </p>
        </div>
        <div
          class="flex flex-col items-center bg-primary/5 dark:bg-primary/10 rounded-xl p-5 text-center shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-lg transition"
        >
          <Activity :size="28" class="text-primary mb-2" />
          <h4
            class="text-base font-semibold text-neutral-dark dark:text-neutral-300 mb-1"
          >
            {{ t('setup_complete.monitor_resources_title') }}
          </h4>
          <p class="text-sm text-neutral dark:text-neutral-400">
            {{ t('setup_complete.monitor_resources_text') }}
          </p>
        </div>
      </div>
    </div>

    <button
      v-if="!props.isReadOnly"
      type="button"
      class="inline-flex items-center gap-2 bg-success hover:bg-success/90 text-white font-semibold rounded-2xl px-8 py-3 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 active:scale-95 text-lg"
      @click="goToDashboard"
      :aria-label="t('setup_complete.dashboard_button')"
    >
      <LayoutDashboard :size="24" />
      {{ t('setup_complete.dashboard_button') }}
    </button>
    <div
      v-else
      class="text-center text-sm text-neutral-500 dark:text-neutral-400"
    >
      <Info :size="16" class="inline mr-2" />
      {{ t('setup.read_only_message') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, withDefaults } from 'vue';
import { useRouter } from 'vue-router';
import {
  CheckCircle,
  Building2,
  BatteryCharging,
  Server,
  Users,
  Plus,
  Activity,
  LayoutDashboard,
  AlertTriangle,
  Info,
} from 'lucide-vue-next';
import { SetupStep } from '../../types';
import { useSetupStore } from '../../store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const setupStore = useSetupStore();
const toast = useToast();
const { t } = useI18n();

interface Props {
  isReadOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReadOnly: false,
});

const isLoading = ref(true);
const fetchError = ref(false);
const configSummary = reactive({
  roomName: t('setup_complete.loading'),
  roomLocation: '',
  upsName: t('setup_complete.loading'),
  upsCapacity: null as number | null,
  serverName: t('setup_complete.loading'),
  serverIp: '',
  serverType: 'physical' as 'physical' | 'virtual',
  serverState: 'inactive' as 'active' | 'inactive',
});

const fetchConfigurationDetails = async () => {
  try {
    isLoading.value = true;
    fetchError.value = false;

    const steps = await setupStore.getSetupProgress();

    const roomStep = steps.find(
      (s: { step: SetupStep }) => s.step === SetupStep.CREATE_ROOM,
    );
    const upsStep = steps.find(
      (s: { step: SetupStep }) => s.step === SetupStep.CREATE_UPS,
    );
    const serverStep = steps.find(
      (s: { step: SetupStep }) => s.step === SetupStep.CREATE_SERVER,
    );

    configSummary.roomName =
      roomStep?.metadata?.name || t('setup_complete.default_room');
    configSummary.roomLocation = roomStep?.metadata?.location || '';
    configSummary.upsName =
      upsStep?.metadata?.name || t('setup_complete.default_ups');
    configSummary.upsCapacity = upsStep?.metadata?.capacity || null;
    configSummary.serverName =
      serverStep?.metadata?.name || t('setup_complete.default_server');
    configSummary.serverIp = serverStep?.metadata?.ip || '';
    configSummary.serverType = serverStep?.metadata?.type || 'physical';
    configSummary.serverState = serverStep?.metadata?.state || 'inactive';
  } catch (error) {
    console.error('Error fetching setup details:', error);
    fetchError.value = true;
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }

  // If not in read-only mode, complete the setup
  if (!props.isReadOnly) {
    try {
      await setupStore.completeSetupStep(SetupStep.COMPLETE);
    } catch (error: any) {
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.message?.includes('déjà été complétée')
      ) {
        toast.info(t('setup_complete.already_done'));
        router.push('/dashboard');
      } else {
        router.push('/404');
        toast.error(t('setup_complete.unexpected_error'));
      }
      return;
    }
  }

  await fetchConfigurationDetails();
});

const goToDashboard = () => {
  localStorage.setItem('setup_completed', 'true');
  localStorage.removeItem('setup_skipped');
  setupStore.resetSetup();
  router.push('/dashboard');
};
</script>

<style>
@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-\[scaleIn_0\.5s_ease-out\] {
  animation: scaleIn 0.5s ease-out;
}
</style>
