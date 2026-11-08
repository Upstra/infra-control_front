<template>
  <div
    class="min-h-screen bg-page relative overflow-hidden"
  >
    <div class="absolute inset-0 opacity-30 dark:opacity-10">
      <div
        class="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 2s"
      ></div>
    </div>

    <div
      class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div class="mb-8 relative">
        <div
          class="absolute inset-0 bg-gradient-to-r from-success to-green-400 rounded-full blur-2xl opacity-20 animate-pulse"
        ></div>
        <div
          class="relative bg-surface p-6 rounded-full shadow-2xl border border-success/20"
        >
          <CheckCircle
            :size="80"
            class="text-success animate-[scaleIn_0.8s_ease-out] drop-shadow-lg"
          />
        </div>
      </div>

      <div class="text-center mb-12 max-w-4xl">
        <h1
          class="text-4xl md:text-6xl font-bold text-text-strong mb-4 tracking-tight"
        >
          {{ t('setup_complete.title') }}
          <span class="inline-block animate-bounce text-4xl md:text-5xl"
            >🎉</span
          >
        </h1>
        <p
          class="text-lg md:text-xl text-text mb-6 leading-relaxed"
        >
          {{ t('setup_complete.description').replace('{app_name}', '') }}
          <span class="text-primary font-semibold">Upstra</span>.
        </p>
        <div
          class="flex items-center justify-center gap-2 text-sm text-text-muted"
        >
          <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span>{{ t('setup_complete.setup_successful') }}</span>
        </div>
      </div>

      <div v-if="isLoading" class="w-full max-w-4xl mb-12">
        <div
          class="bg-surface/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8"
        >
          <div class="animate-pulse">
            <div
              class="h-6 bg-page rounded-full w-1/3 mb-6"
            ></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                class="h-20 bg-surface-sunken animate-pulse rounded-2xl"
              ></div>
              <div
                class="h-20 bg-surface-sunken animate-pulse rounded-2xl"
              ></div>
              <div
                class="h-20 bg-surface-sunken animate-pulse rounded-2xl"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="w-full max-w-4xl mb-12">
        <div
          class="bg-surface/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              class="group bg-surface-raised rounded-2xl p-6 border border-primary-dark hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Building2
                  :size="24"
                  class="text-primary-text"
                />
                <span
                  class="text-xs text-primary-text font-medium"
                  >{{ t('setup_complete.rooms') }}</span
                >
              </div>
              <div
                class="text-3xl font-bold text-primary-text mb-1"
              >
                {{ resourceCounts.rooms }}
              </div>
              <div class="text-sm text-primary-text">
                {{ t('setup_complete.rooms_created') }}
              </div>
            </div>

            <div
              class="group bg-surface-raised rounded-2xl p-6 border border-success-border hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <BatteryCharging
                  :size="24"
                  class="text-success-text"
                />
                <span
                  class="text-xs text-success-text font-medium"
                  >UPS</span
                >
              </div>
              <div
                class="text-3xl font-bold text-success-text mb-1"
              >
                {{ resourceCounts.upsList }}
              </div>
              <div class="text-sm text-success-text">
                {{ t('setup_complete.ups_created') }}
              </div>
            </div>

            <div
              class="group bg-surface-raised rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Server
                  :size="24"
                  class="text-primary-text"
                />
                <span
                  class="text-xs text-primary-text font-medium"
                  >{{ t('setup_complete.servers') }}</span
                >
              </div>
              <div
                class="text-3xl font-bold text-text-strong mb-1"
              >
                {{ resourceCounts.servers }}
              </div>
              <div class="text-sm text-text-muted">
                {{ t('setup_complete.servers_created') }}
              </div>
            </div>

            <div
              v-if="vmDiscoveryResults.totalVms > 0"
              class="group bg-surface-raised rounded-2xl p-6 border border-warning/40 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Monitor
                  :size="24"
                  class="text-warning-text"
                />
                <span
                  class="text-xs text-warning-text font-medium"
                  >VMs</span
                >
              </div>
              <div
                class="text-3xl font-bold text-warning-text mb-1"
              >
                {{ vmDiscoveryResults.totalVms }}
              </div>
              <div class="text-sm text-warning-text">
                {{ t('setup_complete.vms_discovered') }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-if="setupStore.resources.rooms.length > 0"
              class="bg-surface-raised rounded-2xl p-6 border border-primary-dark"
            >
              <h3
                class="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"
              >
                <Building2 :size="20" />
                {{ t('setup_complete.rooms_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="room in setupStore.resources.rooms"
                  :key="room.tempId"
                  class="bg-surface/60 rounded-xl p-4 border border-primary-dark hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-primary-text">
                    {{ room.name }}
                  </div>
                  <div
                    v-if="room.location"
                    class="text-sm text-primary-text mt-1"
                  >
                    {{ room.location }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="setupStore.resources.upsList.length > 0"
              class="bg-surface-raised rounded-2xl p-6 border border-success-border"
            >
              <h3
                class="text-lg font-semibold text-success-text mb-4 flex items-center gap-2"
              >
                <BatteryCharging :size="20" />
                {{ t('setup_complete.ups_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="ups in setupStore.resources.upsList"
                  :key="ups.tempId"
                  class="bg-surface/60 rounded-xl p-4 border border-success-border hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-success-text">
                    {{ ups.name }}
                  </div>
                  <div
                    v-if="ups.capacity"
                    class="text-sm text-success-text mt-1"
                  >
                    {{ ups.capacity }} kVA
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="setupStore.resources.servers.length > 0"
              class="bg-surface-raised rounded-2xl p-6 border border-border"
            >
              <h3
                class="text-lg font-semibold text-text-strong mb-4 flex items-center gap-2"
              >
                <Server :size="20" />
                {{ t('setup_complete.servers_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="server in setupStore.resources.servers"
                  :key="server.tempId"
                  class="bg-surface/60 rounded-xl p-4 border border-border hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-text-strong">
                    {{ server.name }}
                  </div>
                  <div
                    class="text-sm text-text-muted mt-1"
                  >
                    {{ server.ip }}
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      class="text-xs bg-surface-sunken text-text-strong px-2 py-1 rounded-full"
                    >
                      {{
                        server.type === 'vcenter'
                          ? t('setup_complete.type_vcenter')
                          : t('setup_complete.type_esxi')
                      }}
                    </span>
                    <span
                      v-if="getServerVmCount(server.tempId || '') > 0"
                      class="text-xs bg-warning-surface text-warning-text px-2 py-1 rounded-full"
                    >
                      {{ getServerVmCount(server.tempId || '') }} VMs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="fetchError"
            class="mt-6 bg-warning-surface rounded-2xl p-4 border border-warning/40"
          >
            <div
              class="flex items-center gap-2 text-warning-text"
            >
              <AlertTriangle :size="20" />
              <span class="font-medium">{{
                t('setup_complete.fetch_error')
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-4xl mb-12">
        <h3
          class="text-2xl font-bold text-center text-text-strong mb-8"
        >
          {{ t('setup_complete.next_steps_title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="group bg-surface/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-border hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Users :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-text-strong mb-2"
            >
              {{ t('setup_complete.invite_team_title') }}
            </h4>
            <p
              class="text-text text-sm leading-relaxed"
            >
              {{ t('setup_complete.invite_team_text') }}
            </p>
          </div>

          <div
            class="group bg-surface/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-border hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Plus :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-text-strong mb-2"
            >
              {{ t('setup_complete.add_equipment_title') }}
            </h4>
            <p
              class="text-text text-sm leading-relaxed"
            >
              {{ t('setup_complete.add_equipment_text') }}
            </p>
          </div>

          <div
            class="group bg-surface/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-border hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Activity :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-text-strong mb-2"
            >
              {{ t('setup_complete.monitor_resources_title') }}
            </h4>
            <p
              class="text-text text-sm leading-relaxed"
            >
              {{ t('setup_complete.monitor_resources_text') }}
            </p>
          </div>
        </div>
      </div>

      <div class="text-center">
        <button
          v-if="!props.isReadOnly"
          type="button"
          class="group relative inline-flex items-center gap-3 bg-gradient-to-r from-success to-green-500 hover:from-success/90 hover:to-green-500/90 text-white font-semibold rounded-full px-12 py-4 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-success/30 hover:shadow-success/25 hover:scale-105 active:scale-95 text-lg"
          @click="goToDashboard"
        >
          <div
            class="absolute inset-0 bg-surface/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"
          ></div>
          <LayoutDashboard :size="24" class="relative z-10" />
          <span class="relative z-10">{{
            t('setup_complete.dashboard_button')
          }}</span>
        </button>

        <div
          v-else
          class="bg-surface/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border inline-flex items-center gap-2 text-text"
        >
          <Info :size="18" />
          <span class="text-sm">{{ t('setup.read_only_message') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, withDefaults, computed } from 'vue';
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
  Monitor,
} from 'lucide-vue-next';
import { SetupStep } from '../../types';
import { useSetupStore } from '../../store';
import { useVmwareDiscoveryStore } from '../../../vmware/store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { completeSetupAndCleanup } from '../../utils/cleanup';

const router = useRouter();
const setupStore = useSetupStore();
const vmwareStore = useVmwareDiscoveryStore();
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

const resourceCounts = computed(() => ({
  rooms: setupStore.resources.rooms.length,
  upsList: setupStore.resources.upsList.length,
  servers: setupStore.resources.servers.length,
  total:
    setupStore.resources.rooms.length +
    setupStore.resources.upsList.length +
    setupStore.resources.servers.length,
}));

const vmDiscoveryResults = computed(() => ({
  totalVms: vmwareStore.totalVmsDiscovered,
  serverResults: vmwareStore.serverResults,
}));

const getServerVmCount = (serverTempId: string) => {
  const result = vmwareStore.serverResults.find(
    (r) => r.serverId === serverTempId,
  );
  return result ? result.vmCount || 0 : 0;
};

const fetchConfigurationDetails = async () => {
  try {
    isLoading.value = true;
    fetchError.value = false;

    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    fetchError.value = true;
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  if (!setupStore.setupStatus) {
    await setupStore.checkSetupStatus();
  }

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
  // Utiliser l'utilitaire pour marquer comme complété et nettoyer
  completeSetupAndCleanup();

  // Reset le store
  setupStore.resetSetup();

  // Rediriger vers le dashboard
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
