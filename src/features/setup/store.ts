import { defineStore } from 'pinia';
import { ref, computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { setupApi } from './api';
import {
  SetupStep,
  type SetupStatus,
  type BulkRoomDto,
  type BulkUpsDto,
  type BulkServerDto,
  type ImprovedSetupData,
  type BulkImportData,
  type SetupTemplate,
  type BulkCreateRequest,
  type ValidationRequest,
  type ValidationResponse,
} from './types';

let tempIdCounter = 0;
const generateTempId = () => `temp_${Date.now()}_${tempIdCounter++}`;

const SETUP_STORAGE_KEY = 'upstra_setup_resources';
const SETUP_STEP_KEY = 'upstra_setup_current_step';

const saveToLocalStorage = (data: ImprovedSetupData) => {
  try {
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save setup data to localStorage:', error);
  }
};

const loadFromLocalStorage = (): Partial<ImprovedSetupData> | null => {
  try {
    const saved = localStorage.getItem(SETUP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load setup data from localStorage:', error);
    return null;
  }
};

const saveCurrentStep = (step: SetupStep) => {
  try {
    localStorage.setItem(SETUP_STEP_KEY, step);
  } catch (error) {
    console.error('Failed to save current step to localStorage:', error);
  }
};

const loadCurrentStep = (): SetupStep | null => {
  try {
    const saved = localStorage.getItem(SETUP_STEP_KEY);
    return saved as SetupStep | null;
  } catch (error) {
    console.error('Failed to load current step from localStorage:', error);
    return null;
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(SETUP_STORAGE_KEY);
    localStorage.removeItem(SETUP_STEP_KEY);
  } catch (error) {
    console.error('Failed to clear setup data from localStorage:', error);
  }
};

export const useSetupStore = defineStore('setup', () => {
  const router = useRouter();
  const { t } = useI18n();

  const setupStatus = ref<SetupStatus | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentStepData = ref<Record<string, any>>({});
  const vmDiscoveryServerId = ref<string | null>(null);

  const savedData = loadFromLocalStorage();

  const resources = reactive<ImprovedSetupData>({
    rooms: savedData?.rooms || [],
    upsList: savedData?.upsList || [],
    servers: savedData?.servers || [],
    templates: {
      roomTemplates: savedData?.templates?.roomTemplates || [],
      serverTemplates: savedData?.templates?.serverTemplates || [],
    },
  });

  watch(
    resources,
    (newResources) => {
      saveToLocalStorage(newResources);
    },
    { deep: true },
  );

  const isInSetupMode = computed(
    () =>
      setupStatus.value?.isFirstSetup &&
      setupStatus.value?.currentStep !== SetupStep.COMPLETE,
  );

  const progress = computed(() => {
    if (!setupStatus.value) return 0;
    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(setupStatus.value.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  });

  const canGoNext = computed(() => {
    if (!setupStatus.value) return false;
    return setupStatus.value.currentStep !== SetupStep.COMPLETE;
  });

  const canGoPrev = computed(() => {
    if (!setupStatus.value) return false;
    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(setupStatus.value.currentStep);
    return currentIndex > 0;
  });

  const addRoom = (room: Partial<BulkRoomDto>) => {
    const tempId = generateTempId();
    const newRoom = { ...room, tempId } as BulkRoomDto & { id: string };
    newRoom.id = tempId;
    resources.rooms.push(newRoom);
    return newRoom;
  };

  const updateRoom = (id: string, updates: Partial<BulkRoomDto>) => {
    const index = resources.rooms.findIndex((r: any) => r.id === id);
    if (index >= 0) {
      resources.rooms[index] = { ...resources.rooms[index], ...updates };
    }
  };

  const removeRoom = (id: string) => {
    resources.rooms = resources.rooms.filter((r: any) => r.id !== id);
    resources.servers = resources.servers.filter((s: any) => s.roomId !== id);
    resources.upsList = resources.upsList.filter((u: any) => u.roomId !== id);
  };

  const duplicateRoom = (id: string) => {
    const room = resources.rooms.find((r: any) => r.id === id);
    if (room) {
      const newRoom = {
        ...room,
        id: generateTempId(),
        name: `${room.name} (Copy)`,
      };
      resources.rooms.push(newRoom);
      return newRoom;
    }
  };

  const addUps = (ups: Partial<BulkUpsDto>) => {
    const tempId = generateTempId();
    const newUps = { ...ups, tempId } as BulkUpsDto & { id: string };
    newUps.id = tempId;
    resources.upsList.push(newUps);
    return newUps;
  };

  const updateUps = (id: string, updates: Partial<BulkUpsDto>) => {
    const index = resources.upsList.findIndex((u: any) => u.id === id);
    if (index >= 0) {
      resources.upsList[index] = { ...resources.upsList[index], ...updates };
    }
  };

  const removeUps = (id: string) => {
    resources.upsList = resources.upsList.filter((u: any) => u.id !== id);
    resources.servers = resources.servers.filter((s: any) => s.upsId !== id);
  };

  const duplicateUps = (id: string) => {
    const ups = resources.upsList.find((u: any) => u.id === id);
    if (ups) {
      const newUps = {
        ...ups,
        id: generateTempId(),
        name: `${ups.name} (Copy)`,
      };
      resources.upsList.push(newUps);
      return newUps;
    }
  };

  const addServer = (server: Partial<BulkServerDto>) => {
    const tempId = server.id || generateTempId();
    const newServer = { ...server, tempId } as BulkServerDto & { id: string };
    newServer.id = tempId;
    resources.servers.push(newServer);
    return newServer;
  };

  const updateServer = (id: string, updates: Partial<BulkServerDto>) => {
    const index = resources.servers.findIndex((s: any) => s.id === id);
    if (index >= 0) {
      resources.servers[index] = { ...resources.servers[index], ...updates };
    }
  };

  const removeServer = (id: string) => {
    resources.servers = resources.servers.filter((s: any) => s.id !== id);
  };

  const duplicateServer = (id: string) => {
    const server = resources.servers.find((s: any) => s.id === id);
    if (server) {
      const newServer = {
        ...server,
        id: generateTempId(),
        name: `${server.name} (Copy)`,
      };
      resources.servers.push(newServer);
      return newServer;
    }
  };

  const importConfiguration = async (data: BulkImportData) => {
    try {
      // Import rooms
      data.rooms?.forEach((room) =>
        addRoom({
          ...room,
          coolingType: (room as any).coolingType as
            | 'air'
            | 'liquid'
            | 'free'
            | 'hybrid',
        }),
      );

      // Import UPS
      data.upsList?.forEach((ups) =>
        addUps({
          ...ups,
        }),
      );

      data.servers?.forEach((server) =>
        addServer({
          ...server,
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || t('setup_store.import_error'));
    }
  };

  const validateConfiguration = async (
    checkConnectivity = false,
  ): Promise<ValidationResponse> => {
    try {
      const request: ValidationRequest = {
        resources: {
          rooms: resources.rooms.map((room) => ({
            name: room.name,
            tempId: room.tempId,
          })),
          upsList: resources.upsList.map((ups) => ({
            name: ups.name,
            ip: ups.ip,
            roomId: ups.roomId,
            tempId: ups.tempId,
          })),
          servers: resources.servers.map((server) => ({
            name: server.name,
            state: server.state,
            grace_period_on: server.grace_period_on,
            grace_period_off: server.grace_period_off,
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
        },
        checkConnectivity,
      };

      return await setupApi.validateResources(request);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || t('setup_store.validation_error');
      throw new Error(errorMessage);
    }
  };

  const applyConfiguration = async () => {
    try {
      const request: BulkCreateRequest = {
        rooms: resources.rooms.map((room) => ({
          name: room.name,
          tempId: room.tempId,
        })),
        upsList: resources.upsList.map((ups) => ({
          name: ups.name,
          ip: ups.ip,
          roomId: ups.roomId,
          tempId: ups.tempId,
        })),
        servers: resources.servers.map((server) => ({
          name: server.name,
          state: server.state,
          grace_period_on: server.grace_period_on,
          grace_period_off: server.grace_period_off,
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
      };

      const result = await setupApi.bulkCreate(request);

      if (!result.success) {
        throw new Error(t('setup_store.bulk_create_failed'));
      }

      // Clear localStorage after successful creation
      clearLocalStorage();

      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || t('setup_store.apply_error');
      throw new Error(errorMessage);
    }
  };

  const clearResources = () => {
    resources.rooms = [];
    resources.upsList = [];
    resources.servers = [];
    clearLocalStorage();
  };

  const getResourcesCount = computed(() => ({
    rooms: resources.rooms.length,
    ups: resources.upsList.length,
    servers: resources.servers.length,
    total:
      resources.rooms.length +
      resources.upsList.length +
      resources.servers.length,
  }));

  const hasResources = computed(() => getResourcesCount.value.total > 0);

  const checkSetupStatus = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const status = await setupApi.getStatus();
      setupStatus.value = status;

      if (status && status.currentStepIndex < status.totalSteps) {
        // Check if we have a saved step that's further along than what backend reports
        const savedStep = loadCurrentStep();
        const savedResources = loadFromLocalStorage();

        let targetStep = status.currentStep;

        // If we have saved data and a saved step, use the saved step
        if (
          savedStep &&
          savedResources &&
          ((savedResources.rooms?.length || 0) > 0 ||
            (savedResources.upsList?.length || 0) > 0 ||
            (savedResources.servers?.length || 0) > 0)
        ) {
          // Verify the saved step is valid and further along than backend's current step
          const stepOrder = [
            SetupStep.WELCOME,
            SetupStep.RESOURCE_PLANNING,
            SetupStep.ROOMS_CONFIG,
            SetupStep.UPS_CONFIG,
            SetupStep.SERVERS_CONFIG,
            SetupStep.RELATIONSHIPS,
            SetupStep.REVIEW,
            SetupStep.COMPLETE,
          ];

          const savedIndex = stepOrder.indexOf(savedStep);
          const backendIndex = stepOrder.indexOf(status.currentStep);

          if (savedIndex > backendIndex) {
            targetStep = savedStep;
          }
        }

        await router.push(`/setup/${targetStep}`);
      }
    } catch (err: any) {
      error.value = err.message ?? t('setup_store.status_error');
    } finally {
      isLoading.value = false;
    }
  };

  const saveStepData = (step: SetupStep, data: any) => {
    currentStepData.value[step] = data;
  };

  const getStepData = (step: SetupStep) => {
    return currentStepData.value[step] ?? {};
  };

  const completeCurrentStep = async () => {
    if (!setupStatus.value) {
      await checkSetupStatus();
      if (!setupStatus.value) {
        throw new Error(t('setup_store.config_error'));
      }
    }
    await checkSetupStatus();
  };

  const goToNextStep = async () => {
    if (!canGoNext.value) return;

    const stepOrder = [
      SetupStep.WELCOME,
      SetupStep.RESOURCE_PLANNING,
      SetupStep.ROOMS_CONFIG,
      SetupStep.UPS_CONFIG,
      SetupStep.SERVERS_CONFIG,
      SetupStep.RELATIONSHIPS,
      SetupStep.REVIEW,
      SetupStep.COMPLETE,
    ];

    const currentStep = setupStatus.value!.currentStep;
    const currentIndex = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[currentIndex + 1];

    if (nextStep) {
      if (setupStatus.value) {
        setupStatus.value.currentStep = nextStep;
        setupStatus.value.currentStepIndex = currentIndex + 1;
      }
      saveCurrentStep(nextStep);
      await router.push(`/setup/${nextStep}`);
    }
  };

  const goToPrevStep = async () => {
    if (!canGoPrev.value) return;

    const stepOrder = [
      SetupStep.WELCOME,
      SetupStep.RESOURCE_PLANNING,
      SetupStep.ROOMS_CONFIG,
      SetupStep.UPS_CONFIG,
      SetupStep.SERVERS_CONFIG,
      SetupStep.RELATIONSHIPS,
      SetupStep.REVIEW,
      SetupStep.COMPLETE,
    ];

    const currentStep = setupStatus.value!.currentStep;
    const currentIndex = stepOrder.indexOf(currentStep);
    const prevStep = stepOrder[currentIndex - 1];

    if (prevStep) {
      if (setupStatus.value) {
        setupStatus.value.currentStep = prevStep;
        setupStatus.value.currentStepIndex = currentIndex - 1;
      }
      saveCurrentStep(prevStep);
      await router.push(`/setup/${prevStep}`);
    }
  };

  const skipSetup = async () => {
    localStorage.setItem('setup_skipped', 'true');
    await router.push('/dashboard');
  };

  const resetSetup = () => {
    setupStatus.value = null;
    currentStepData.value = {};
    clearResources();
    error.value = null;
  };

  const completeVmDiscovery = async (serverId: string, vmIds: string[]) => {
    isLoading.value = true;
    error.value = null;
    try {
      const status = await setupApi.completeVmDiscovery({
        serverId,
        vmCount: vmIds.length,
        vmIds,
      });
      setupStatus.value = status;
      if (status.currentStep) await router.push(`/setup/${status.currentStep}`);
    } catch (err: any) {
      error.value = err.message ?? t('setup_store.discovery_error');
    } finally {
      isLoading.value = false;
    }
  };

  const completeSetupStep = async (
    step: SetupStep,
    metadata?: Record<string, any>,
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      await setupApi.completeStep(step, metadata);
      await checkSetupStatus();
    } catch (err: any) {
      error.value = err.message ?? t('setup_store.step_error');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getSetupProgress = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      return await setupApi.getProgress();
    } catch (err: any) {
      error.value = err.message ?? t('setup_store.progress_error');
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const setVmDiscoveryServerId = (serverId: string) => {
    vmDiscoveryServerId.value = serverId;
  };

  const getVmDiscoveryServerId = () => vmDiscoveryServerId.value;

  const applyTemplate = (template: SetupTemplate) => {
    clearResources();

    template.configuration.rooms?.forEach((roomTemplate) => {
      addRoom(roomTemplate);
    });

    template.configuration.upsList?.forEach((upsTemplate) => {
      addUps(upsTemplate);
    });

    template.configuration.servers?.forEach((serverTemplate) => {
      addServer(serverTemplate);
    });
  };

  const loadTemplates = async () => {
    try {
      return await setupApi.getTemplates();
    } catch (err: any) {
      throw new Error(err.message || t('setup_store.template_load_error'));
    }
  };

  const saveTemplate = async (name: string, description: string) => {
    try {
      const template: Omit<SetupTemplate, 'id' | 'createdAt' | 'createdBy'> = {
        name,
        description,
        type: 'custom',
        configuration: {
          rooms: resources.rooms.map((room) => ({
            name: room.name,
            tempId: room.tempId,
          })),
          upsList: resources.upsList.map((ups) => ({
            name: ups.name,
            ip: ups.ip,
            roomId: ups.roomId,
            tempId: ups.tempId,
          })),
          servers: resources.servers.map((server) => ({
            name: server.name,
            state: server.state,
            grace_period_on: server.grace_period_on,
            grace_period_off: server.grace_period_off,
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
        },
      };

      return await setupApi.createTemplate(template);
    } catch (err: any) {
      throw new Error(err.message || t('setup_store.template_save_error'));
    }
  };

  return {
    setupStatus,
    isLoading,
    error,
    currentStepData,
    resources,

    isInSetupMode,
    progress,
    canGoNext,
    canGoPrev,
    getResourcesCount,
    hasResources,

    checkSetupStatus,
    saveStepData,
    getStepData,
    completeCurrentStep,
    completeVmDiscovery,
    goToNextStep,
    goToPrevStep,
    skipSetup,
    resetSetup,
    completeSetupStep,
    getSetupProgress,

    addRoom,
    updateRoom,
    removeRoom,
    duplicateRoom,
    addUps,
    updateUps,
    removeUps,
    duplicateUps,
    addServer,
    updateServer,
    removeServer,
    duplicateServer,
    setVmDiscoveryServerId,
    getVmDiscoveryServerId,

    importConfiguration,
    validateConfiguration,
    applyConfiguration,
    clearResources,
    applyTemplate,
    loadTemplates,
    saveTemplate,
  };
});
