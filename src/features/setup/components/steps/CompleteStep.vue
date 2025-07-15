<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden"
  >
    <div class="absolute inset-0 opacity-30">
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
          class="relative bg-white dark:bg-neutral-800 p-6 rounded-full shadow-2xl border border-success/20 dark:border-success/30"
        >
          <CheckCircle
            :size="80"
            class="text-success animate-[scaleIn_0.8s_ease-out] drop-shadow-lg"
          />
        </div>
      </div>

      <div class="text-center mb-12 max-w-4xl">
        <h1
          class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mb-4 tracking-tight"
        >
          {{ t('setup_complete.title') }}
          <span class="inline-block animate-bounce text-4xl md:text-5xl"
            >🎉</span
          >
        </h1>
        <p
          class="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed"
        >
          {{ t('setup_complete.description').replace('{app_name}', '') }}
          <span class="text-primary font-semibold">Upstra</span>.
        </p>
        <div
          class="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
        >
          <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span>{{ t('setup_complete.setup_successful') }}</span>
        </div>
      </div>

      <div v-if="isLoading" class="w-full max-w-4xl mb-12">
        <div
          class="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-8"
        >
          <div class="animate-pulse">
            <div
              class="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-1/3 mb-6"
            ></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                class="h-20 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl"
              ></div>
              <div
                class="h-20 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl"
              ></div>
              <div
                class="h-20 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="w-full max-w-4xl mb-12">
        <div
          class="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-8"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              class="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Building2
                  :size="24"
                  class="text-blue-600 dark:text-blue-400"
                />
                <span
                  class="text-xs text-blue-600 dark:text-blue-400 font-medium"
                  >{{ t('setup_complete.rooms') }}</span
                >
              </div>
              <div
                class="text-3xl font-bold text-blue-900 dark:text-blue-300 mb-1"
              >
                {{ resourceCounts.rooms }}
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-400">
                {{ t('setup_complete.rooms_created') }}
              </div>
            </div>

            <div
              class="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <BatteryCharging
                  :size="24"
                  class="text-green-600 dark:text-green-400"
                />
                <span
                  class="text-xs text-green-600 dark:text-green-400 font-medium"
                  >UPS</span
                >
              </div>
              <div
                class="text-3xl font-bold text-green-900 dark:text-green-300 mb-1"
              >
                {{ resourceCounts.upsList }}
              </div>
              <div class="text-sm text-green-700 dark:text-green-400">
                {{ t('setup_complete.ups_created') }}
              </div>
            </div>

            <div
              class="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Server
                  :size="24"
                  class="text-purple-600 dark:text-purple-400"
                />
                <span
                  class="text-xs text-purple-600 dark:text-purple-400 font-medium"
                  >{{ t('setup_complete.servers') }}</span
                >
              </div>
              <div
                class="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-1"
              >
                {{ resourceCounts.servers }}
              </div>
              <div class="text-sm text-purple-700 dark:text-purple-400">
                {{ t('setup_complete.servers_created') }}
              </div>
            </div>

            <div
              v-if="vmDiscoveryResults.totalVms > 0"
              class="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-2">
                <Monitor
                  :size="24"
                  class="text-orange-600 dark:text-orange-400"
                />
                <span
                  class="text-xs text-orange-600 dark:text-orange-400 font-medium"
                  >VMs</span
                >
              </div>
              <div
                class="text-3xl font-bold text-orange-900 dark:text-orange-300 mb-1"
              >
                {{ vmDiscoveryResults.totalVms }}
              </div>
              <div class="text-sm text-orange-700 dark:text-orange-400">
                {{ t('setup_complete.vms_discovered') }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-if="setupStore.resources.rooms.length > 0"
              class="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30"
            >
              <h3
                class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2"
              >
                <Building2 :size="20" />
                {{ t('setup_complete.rooms_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="room in setupStore.resources.rooms"
                  :key="room.tempId"
                  class="bg-white/60 dark:bg-neutral-800/60 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30 hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-blue-900 dark:text-blue-300">
                    {{ room.name }}
                  </div>
                  <div
                    v-if="room.location"
                    class="text-sm text-blue-700 dark:text-blue-400 mt-1"
                  >
                    {{ room.location }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="setupStore.resources.upsList.length > 0"
              class="bg-gradient-to-r from-green-50/50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/10 rounded-2xl p-6 border border-green-200/30 dark:border-green-700/30"
            >
              <h3
                class="text-lg font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2"
              >
                <BatteryCharging :size="20" />
                {{ t('setup_complete.ups_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="ups in setupStore.resources.upsList"
                  :key="ups.tempId"
                  class="bg-white/60 dark:bg-neutral-800/60 rounded-xl p-4 border border-green-200/30 dark:border-green-700/30 hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-green-900 dark:text-green-300">
                    {{ ups.name }}
                  </div>
                  <div
                    v-if="ups.capacity"
                    class="text-sm text-green-700 dark:text-green-400 mt-1"
                  >
                    {{ ups.capacity }} kVA
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="setupStore.resources.servers.length > 0"
              class="bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30"
            >
              <h3
                class="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2"
              >
                <Server :size="20" />
                {{ t('setup_complete.servers_section') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="server in setupStore.resources.servers"
                  :key="server.tempId"
                  class="bg-white/60 dark:bg-neutral-800/60 rounded-xl p-4 border border-purple-200/30 dark:border-purple-700/30 hover:shadow-md transition-all duration-300"
                >
                  <div class="font-medium text-purple-900 dark:text-purple-300">
                    {{ server.name }}
                  </div>
                  <div
                    class="text-sm text-purple-700 dark:text-purple-400 mt-1"
                  >
                    {{ server.ip }}
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full"
                    >
                      {{
                        server.type === 'vcenter'
                          ? t('setup_complete.type_vcenter')
                          : t('setup_complete.type_esxi')
                      }}
                    </span>
                    <span
                      v-if="getServerVmCount(server.tempId || '') > 0"
                      class="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full"
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
            class="mt-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-4 border border-yellow-200/50 dark:border-yellow-700/50"
          >
            <div
              class="flex items-center gap-2 text-yellow-800 dark:text-yellow-300"
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
          class="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-8"
        >
          {{ t('setup_complete.next_steps_title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="group bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Users :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-neutral-900 dark:text-white mb-2"
            >
              {{ t('setup_complete.invite_team_title') }}
            </h4>
            <p
              class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
            >
              {{ t('setup_complete.invite_team_text') }}
            </p>
          </div>

          <div
            class="group bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Plus :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-neutral-900 dark:text-white mb-2"
            >
              {{ t('setup_complete.add_equipment_title') }}
            </h4>
            <p
              class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
            >
              {{ t('setup_complete.add_equipment_text') }}
            </p>
          </div>

          <div
            class="group bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div
              class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl mb-4 inline-block"
            >
              <Activity :size="32" class="text-white" />
            </div>
            <h4
              class="text-lg font-semibold text-neutral-900 dark:text-white mb-2"
            >
              {{ t('setup_complete.monitor_resources_title') }}
            </h4>
            <p
              class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
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
            class="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"
          ></div>
          <LayoutDashboard :size="24" class="relative z-10" />
          <span class="relative z-10">{{
            t('setup_complete.dashboard_button')
          }}</span>
        </button>

        <div
          v-else
          class="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full px-6 py-3 border border-neutral-200/50 dark:border-neutral-700/50 inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
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
