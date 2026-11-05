<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-text-strong tracking-tight"
      >
        {{ t('setup.review.title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-text-strong max-w-lg mx-auto"
      >
        {{ t('setup.review.description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full space-y-8">
      <div
        v-if="isValidating"
        class="bg-surface shadow rounded-lg p-6"
      >
        <div class="flex items-center justify-center py-8">
          <Loader2
            class="animate-spin h-8 w-8 text-primary-text mr-3"
          />
          <span class="text-text">{{
            t('setup.review.validating_configuration')
          }}</span>
        </div>
      </div>

      <div
        v-if="!isValidating"
        class="bg-surface shadow rounded-lg p-6"
      >
        <h3
          class="text-lg font-medium text-text-strong mb-4 flex items-center"
        >
          <Building2
            :size="20"
            class="mr-2 text-primary-text"
          />
          {{ t('setup.review.rooms_section') }}
          <span
            class="ml-auto text-sm font-normal text-text-muted"
          >
            {{ setupStore.getResourcesCount.rooms }}
            {{ t('setup.review.configured') }}
          </span>
        </h3>

        <div
          v-if="setupStore.resources.rooms.length === 0"
          class="text-text-muted text-sm"
        >
          {{ t('setup.review.no_rooms') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(room, index) in setupStore.resources.rooms"
            :key="room.id || room.tempId"
            :class="[
              'border rounded-md p-3 flex items-center justify-between',
              hasValidationError('room', index)
                ? 'border-danger-border bg-danger-surface'
                : 'border-border',
            ]"
          >
            <div>
              <h4 class="font-medium text-text-strong">
                {{ room.name }}
              </h4>
              <p
                v-if="room.location || room.capacity || room.coolingType"
                class="text-sm text-text-muted"
              >
                <span
                  v-if="room.location"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <MapPin :size="12" />
                  {{ room.location }}
                </span>
                <span
                  v-if="room.capacity"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <Server :size="12" />
                  {{ room.capacity }} {{ t('setup.review.servers_capacity') }}
                </span>
                <span
                  v-if="room.coolingType"
                  class="inline-flex items-center gap-1"
                >
                  <Wind :size="12" />
                  {{ t(`setup_room.cooling_${room.coolingType}`) }}
                </span>
              </p>
              <p
                v-if="hasValidationError('room', index)"
                class="text-sm text-danger-text mt-1"
              >
                {{ getValidationError('room', index) }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <XCircle
                v-if="hasValidationError('room', index)"
                :size="20"
                class="text-danger-text"
              />
              <CheckCircle v-else :size="20" class="text-success-text" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!isValidating"
        class="bg-surface shadow rounded-lg p-6"
      >
        <h3
          class="text-lg font-medium text-text-strong mb-4 flex items-center"
        >
          <Zap :size="20" class="mr-2 text-primary-text" />
          {{ t('setup.review.ups_section') }}
          <span
            class="ml-auto text-sm font-normal text-text-muted"
          >
            {{ setupStore.getResourcesCount.ups }}
            {{ t('setup.review.configured') }}
          </span>
        </h3>

        <div
          v-if="setupStore.resources.upsList.length === 0"
          class="text-text-muted text-sm"
        >
          {{ t('setup.review.no_ups') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(ups, index) in setupStore.resources.upsList"
            :key="ups.id || ups.tempId"
            :class="[
              'border rounded-md p-3 flex items-center justify-between',
              hasValidationError('ups', index)
                ? 'border-danger-border bg-danger-surface'
                : 'border-border',
            ]"
          >
            <div>
              <h4 class="font-medium text-text-strong">
                {{ ups.name }}
              </h4>
              <p class="text-sm text-text-muted">
                <span
                  v-if="ups.roomId"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <Building2 :size="12" />
                  {{ getRoomName(ups.roomId) }}
                </span>
                <span
                  v-if="ups.brand || ups.model"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <Package :size="12" />
                  {{ ups.brand }} {{ ups.model }}
                </span>
                <span
                  v-if="ups.capacity"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <BatteryCharging :size="12" />
                  {{ ups.capacity }}VA
                </span>
                <span v-if="ups.ip" class="inline-flex items-center gap-1">
                  <Globe :size="12" />
                  {{ ups.ip }}
                </span>
              </p>
              <p
                v-if="hasValidationError('ups', index)"
                class="text-sm text-danger-text mt-1"
              >
                {{ getValidationError('ups', index) }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <AlertCircle
                v-if="hasConnectivityIssue('ups', index)"
                :size="20"
                class="text-warning-text"
                v-tooltip="t('setup.review.connectivity_issue')"
              />
              <XCircle
                v-if="hasValidationError('ups', index)"
                :size="20"
                class="text-danger-text"
              />
              <CheckCircle
                v-else-if="!hasConnectivityIssue('ups', index)"
                :size="20"
                class="text-success-text"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!isValidating"
        class="bg-surface shadow rounded-lg p-6"
      >
        <h3
          class="text-lg font-medium text-text-strong mb-4 flex items-center"
        >
          <HardDrive
            :size="20"
            class="mr-2 text-primary-text"
          />
          {{ t('setup.review.servers_section') }}
          <span
            class="ml-auto text-sm font-normal text-text-muted"
          >
            {{ setupStore.getResourcesCount.servers }}
            {{ t('setup.review.configured') }}
          </span>
        </h3>

        <div
          v-if="setupStore.resources.servers.length === 0"
          class="text-text-muted text-sm"
        >
          {{ t('setup.review.no_servers') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(server, index) in setupStore.resources.servers"
            :key="server.id || server.tempId"
            :class="[
              'border rounded-md p-3 flex items-center justify-between',
              hasValidationError('server', index)
                ? 'border-danger-border bg-danger-surface'
                : 'border-border',
            ]"
          >
            <div>
              <h4 class="font-medium text-text-strong">
                {{ server.name }}
              </h4>
              <p class="text-sm text-text-muted">
                <span
                  v-if="server.roomId"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <Building2 :size="12" />
                  {{ getRoomName(server.roomId) }}
                </span>
                <span
                  v-if="server.upsId"
                  class="inline-flex items-center gap-1 mr-3"
                >
                  <Zap :size="12" />
                  {{ getUpsName(server.upsId) }}
                </span>
                <span class="inline-flex items-center gap-1 mr-3">
                  <Globe :size="12" />
                  {{ server.ip }}
                </span>
                <span class="inline-flex items-center gap-1 mr-3">
                  <Monitor :size="12" />
                  {{
                    server.type === 'vcenter'
                      ? t('setup_server.type_vcenter')
                      : t('setup_server.type_esxi')
                  }}
                </span>
                <span
                  v-if="server.priority > 1"
                  class="inline-flex items-center gap-1"
                >
                  <Star :size="12" />
                  {{ t('setup.review.priority') }}: {{ server.priority }}
                </span>
              </p>
              <p
                v-if="hasValidationError('server', index)"
                class="text-sm text-danger-text mt-1"
              >
                {{ getValidationError('server', index) }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <AlertCircle
                v-if="hasConnectivityIssue('servers', index)"
                :size="20"
                class="text-warning-text"
                v-tooltip="t('setup.review.connectivity_issue')"
              />
              <XCircle
                v-if="hasValidationError('server', index)"
                :size="20"
                class="text-danger-text"
              />
              <CheckCircle
                v-else-if="!hasConnectivityIssue('servers', index)"
                :size="20"
                class="text-success-text"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!isValidating && validationResult && !validationResult.valid"
        class="bg-danger-surface border border-danger-border rounded-lg p-4"
      >
        <div class="flex">
          <XCircle
            :size="20"
            class="text-danger-text flex-shrink-0 mt-0.5"
          />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-danger-text">
              {{ t('setup.review.validation_errors_title') }}
            </h4>
            <p class="mt-1 text-sm text-danger-text">
              {{ t('setup.review.validation_errors_message') }}
            </p>
            <ul
              class="mt-2 list-disc list-inside text-sm text-danger-text"
            >
              <li v-for="(error, idx) in validationResult.errors" :key="idx">
                {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        v-if="!isValidating && setupStore.hasVmwareServers"
        class="bg-warning-surface border border-warning/40 rounded-lg p-4"
      >
        <div class="flex">
          <Globe
            :size="20"
            class="text-warning-text flex-shrink-0 mt-0.5"
          />
          <div class="ml-3">
            <h4
              class="text-sm font-medium text-warning-text"
            >
              {{ t('setup.review.vmware_detected_title') }}
            </h4>
            <p class="mt-1 text-sm text-warning-text">
              {{ t('setup.review.vmware_detected_message') }}
            </p>
            <label class="flex items-center mt-2">
              <input
                v-model="setupStore.vmwareDiscoveryEnabled"
                type="checkbox"
                class="h-4 w-4 text-primary-text focus:ring-primary border-border-control rounded"
              />
              <span class="ml-2 text-sm text-warning-text">
                {{ t('setup.review.enable_vmware_discovery') }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div
        v-if="!isValidating"
        class="bg-[rgb(var(--c-primary-hover)/0.1)] border border-primary-dark rounded-lg p-4"
      >
        <div class="flex">
          <Info
            :size="20"
            class="text-primary-text flex-shrink-0 mt-0.5"
          />
          <div class="ml-3">
            <h4 class="text-sm font-medium text-primary-text">
              {{ t('setup.review.info_title') }}
            </h4>
            <p class="mt-1 text-sm text-primary-text">
              {{ t('setup.review.info_message') }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button
            @click="handleBack"
            class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ChevronLeft :size="16" class="mr-2" />
            {{ t('common.back') }}
          </button>

          <button
            @click="handleResetAll"
            class="inline-flex items-center px-4 py-2 border border-danger-border shadow-sm text-sm font-medium rounded-md text-danger-text bg-surface hover:bg-danger-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {{ t('setup.review.reset_all') }}
          </button>
        </div>

        <div class="flex items-center space-x-4">
          <button
            @click="handleRefreshValidation"
            :disabled="isValidating || isApplying"
            class="inline-flex items-center px-4 py-2 border border-border-control shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isValidating" :size="16" class="animate-spin mr-2" />
            <RefreshCw v-else :size="16" class="mr-2" />
            {{ t('setup.review.refresh_validation') }}
          </button>

          <button
            @click="handleApply"
            :disabled="!canApply || isApplying"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isApplying" :size="20" class="animate-spin mr-2" />
            <CheckCircle v-else :size="20" class="mr-2" />
            {{
              isApplying
                ? t('setup.review.applying')
                : t('setup.review.apply_button')
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSetupStore } from '../../store';
import { useToast } from 'vue-toast-notification';
import {
  Building2,
  Zap,
  Globe,
  HardDrive,
  Monitor,
  Star,
  MapPin,
  Server,
  Wind,
  Package,
  BatteryCharging,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from 'lucide-vue-next';

const setupStore = useSetupStore();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const isApplying = ref(false);
const isValidating = ref(false);
const validationResult = ref<any>(null);
const showValidationErrors = ref(false);

const canApply = computed(
  () =>
    setupStore.hasResources &&
    !isValidating.value &&
    (!validationResult.value || validationResult.value.valid),
);

const getRoomName = (roomId: string | undefined) => {
  if (!roomId) return t('setup.review.unknown_room');
  const room = setupStore.resources.rooms.find(
    (r: any) => r.id === roomId || r.tempId === roomId,
  );
  return room?.name || t('setup.review.unknown_room');
};

const getUpsName = (upsId: string) => {
  const ups = setupStore.resources.upsList.find(
    (u: any) => u.id === upsId || u.tempId === upsId,
  );
  return ups?.name || t('setup.review.unknown_ups');
};

const hasValidationError = (resource: string, index: number): boolean => {
  if (!validationResult.value || !validationResult.value.errors) return false;
  return validationResult.value.errors.some(
    (error: any) => error.resource === resource && error.index === index,
  );
};

const getValidationError = (resource: string, index: number): string => {
  if (!validationResult.value || !validationResult.value.errors) return '';
  const error = validationResult.value.errors.find(
    (error: any) => error.resource === resource && error.index === index,
  );
  return error ? error.message : '';
};

const hasConnectivityIssue = (resource: string, index: number): boolean => {
  if (!validationResult.value || !validationResult.value.connectivityResults)
    return false;
  const results = validationResult.value.connectivityResults[resource];
  if (!results) return false;
  const result = results.find((r: any) => r.index === index);
  return result ? !result.accessible : false;
};

const handleBack = async () => {
  await setupStore.goToPrevStep();
};

const handleResetAll = () => {
  if (confirm(t('setup.review.reset_all_confirm'))) {
    setupStore.clearResources();
    toast.success(t('setup.review.reset_all_success'));
    router.push('/setup/planning');
  }
};

const handleRefreshValidation = async () => {
  isValidating.value = true;
  showValidationErrors.value = false;
  validationResult.value = null;

  try {
    const validation = await setupStore.validateConfiguration(true);
    validationResult.value = validation;

    if (validation.valid) {
      toast.success(t('setup.review.validation_success'));
    } else {
      toast.warning(t('setup.review.validation_warnings'));
      showValidationErrors.value = true;
    }
  } catch (error: any) {
    console.error('Validation error:', error);
    toast.error(error.message || t('setup.review.validation_error'));
  } finally {
    isValidating.value = false;
  }
};

const handleApply = async () => {
  if (!canApply.value) return;

  isApplying.value = true;

  try {
    if (!validationResult.value || !validationResult.value.valid) {
      toast.info(t('setup.review.validating'));
      const validation = await setupStore.validateConfiguration(true);
      validationResult.value = validation;

      if (!validation.valid) {
        toast.error(t('setup.review.validation_failed'));
        showValidationErrors.value = true;
        console.error('Validation errors:', validation.errors);
        return;
      }
    }

    if (
      validationResult.value.warnings &&
      validationResult.value.warnings.length > 0
    ) {
      console.warn('Validation warnings:', validationResult.value.warnings);
    }

    toast.info(t('setup.review.creating_resources'));

    const { setupApi } = await import('../../api');
    const response = await setupApi.bulkCreateWithDiscovery({
      rooms: setupStore.resources.rooms.map((room) => ({
        name: room.name,
        tempId: room.tempId,
      })),
      upsList: setupStore.resources.upsList.map((ups) => ({
        name: ups.name,
        ip: ups.ip,
        roomId: ups.roomId,
        tempId: ups.tempId,
        grace_period_on: ups.grace_period_on,
        grace_period_off: ups.grace_period_off,
      })),
      servers: setupStore.resources.servers.map((server) => ({
        name: server.name,
        state: server.state,
        adminUrl: server.adminUrl,
        ip: server.ip,
        login: server.login,
        password: server.password,
        type: server.type,
        priority: server.priority,
        roomId: server.roomId,
        upsId: server.upsId,
        groupId: server.groupId,
        ilo_name: server.ilo_name,
        ilo_ip: server.ilo_ip,
        ilo_login: server.ilo_login,
        ilo_password: server.ilo_password,
        tempId: server.tempId,
      })),
      enableDiscovery:
        setupStore.vmwareDiscoveryEnabled && setupStore.hasVmwareServers,
    });

    const result = {
      success: response.success,
      created: response.created,
      errors: response.success ? [] : ['Creation failed'],
    };

    if (response.discoverySessionId) {
      setupStore.discoverySessionId = response.discoverySessionId;
    }

    if (result.errors && result.errors.length > 0) {
      toast.warning(t('setup.review.partial_success'));
      console.warn('Creation errors:', result.errors);
    } else {
      toast.success(t('setup.review.apply_success'));
    }

    // Store discovery session ID for VM discovery step
    if (response.discoverySessionId) {
      setupStore.discoverySessionId = response.discoverySessionId;
    }

    // Always go to next step in normal flow (VM_DISCOVERY or COMPLETE)
    await setupStore.goToNextStep();
  } catch (error: any) {
    toast.error(error.message || t('setup.review.apply_error'));
  } finally {
    isApplying.value = false;
  }
};

onMounted(async () => {
  const { useVmwareDiscoveryStore } = await import('@/features/vmware/store');
  const vmwareStore = useVmwareDiscoveryStore();

  const hasActiveDiscovery = await vmwareStore.checkActiveDiscovery();
  if (
    hasActiveDiscovery &&
    (vmwareStore.status === 'starting' || vmwareStore.status === 'discovering')
  ) {
    setupStore.discoverySessionId = vmwareStore.sessionId;
    await router.push('/setup/vm-discovery');
    return;
  }

  if (setupStore.hasResources) {
    isValidating.value = true;
    try {
      const validation = await setupStore.validateConfiguration(true);
      validationResult.value = validation;

      if (!validation.valid) {
        showValidationErrors.value = true;

        toast.warning(t('setup.review.validation_warning_on_load'));
      }
    } catch (error) {
      console.error('Initial validation error:', error);
    } finally {
      isValidating.value = false;
    }
  }
});
</script>
