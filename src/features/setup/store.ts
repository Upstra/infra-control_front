import { defineStore } from 'pinia';
import { ref, computed, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { setupApi } from './api';
import {
  SetupStep,
  SETUP_STEP_ORDER,
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
  const route = useRoute();
  const { t } = useI18n();

  const setupStatus = ref<SetupStatus | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentStepData = ref<Record<string, any>>({});
  const vmDiscoveryServerId = ref<string | null>(null);
  const discoverySessionId = ref<string | null>(null);
  const vmwareDiscoveryEnabled = ref(true);

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
    const currentIndex = SETUP_STEP_ORDER.indexOf(
      setupStatus.value.currentStep,
    );
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / SETUP_STEP_ORDER.length) * 100);
  });

  const canGoNext = computed(() => {
    if (!setupStatus.value) return false;
    const currentIndex = SETUP_STEP_ORDER.indexOf(
      setupStatus.value.currentStep,
    );
    return currentIndex < SETUP_STEP_ORDER.length - 1;
  });

  const canGoPrev = computed(() => {
    if (!setupStatus.value) return false;
    const currentIndex = SETUP_STEP_ORDER.indexOf(
      setupStatus.value.currentStep,
    );
    return currentIndex > 0;
  });

  const addRoom = (room: Partial<BulkRoomDto>) => {
    const tempId = generateTempId();
    const newRoom = { ...room, tempId } as BulkRoomDto & { id: string };
    newRoom.id = tempId;
    resources.rooms.push(newRoom);
    updateLocalProgress();
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
    updateLocalProgress();
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
    updateLocalProgress();
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
      const tempIdMapping: Record<string, string> = {};

      data.rooms?.forEach((room) => {
        const newRoom = addRoom({
          ...room,
          coolingType: (room as any).coolingType as
            | 'air'
            | 'liquid'
            | 'free'
            | 'hybrid',
        });
        const roomKey = (room as any).tempId || (room as any).id;
        if (roomKey && newRoom.tempId) {
          tempIdMapping[roomKey] = newRoom.tempId;
        }
      });

      data.upsList?.forEach((ups) => {
        const mappedRoomId =
          ups.roomId && tempIdMapping[ups.roomId]
            ? tempIdMapping[ups.roomId]
            : ups.roomId;
        const newUps = addUps({
          ...ups,
          roomId: mappedRoomId,
        });
        const upsKey = (ups as any).tempId || (ups as any).id;
        if (upsKey && newUps.tempId) {
          tempIdMapping[upsKey] = newUps.tempId;
        }
      });

      data.servers?.forEach((server) => {
        const mappedRoomId =
          server.roomId && tempIdMapping[server.roomId]
            ? tempIdMapping[server.roomId]
            : server.roomId;
        const mappedUpsId =
          server.upsId && tempIdMapping[server.upsId]
            ? tempIdMapping[server.upsId]
            : server.upsId;
        addServer({
          ...server,
          roomId: mappedRoomId,
          upsId: mappedUpsId,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      updateLocalProgress();

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
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        t('setup_store.validation_error');
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

      clearLocalStorage();

      return result;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        t('setup_store.apply_error');
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

  const hasVmwareServers = computed(() => {
    return resources.servers.some(
      (server) => server.type === 'vcenter' || server.type === 'esxi',
    );
  });

  const checkSetupStatus = async () => {
    // Check if setup is already completed in localStorage
    if (localStorage.getItem('setup_completed') === 'true') {
      setupStatus.value = {
        isFirstSetup: false,
        hasAdminUser: true,
        hasRooms: true,
        hasUps: true,
        hasServers: true,
        currentStep: SetupStep.COMPLETE,
        currentStepIndex: SETUP_STEP_ORDER.length - 1,
        totalSteps: SETUP_STEP_ORDER.length,
      };
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const status = await setupApi.getStatus();
      const currentRoute = route.params.step as SetupStep;

      // Si on a un statut API, on l'utilise comme base mais on corrige totalSteps
      setupStatus.value = {
        ...status,
        totalSteps: SETUP_STEP_ORDER.length,
      };

      if (status && status.currentStepIndex < SETUP_STEP_ORDER.length) {
        const savedStep = loadCurrentStep();
        const savedResources = loadFromLocalStorage();

        let targetStep = status.currentStep;

        // Si on a des ressources locales sauvegardées et une étape sauvegardée
        if (
          savedStep &&
          savedResources &&
          ((savedResources.rooms?.length || 0) > 0 ||
            (savedResources.upsList?.length || 0) > 0 ||
            (savedResources.servers?.length || 0) > 0)
        ) {
          const savedIndex = SETUP_STEP_ORDER.indexOf(savedStep);
          const backendIndex = SETUP_STEP_ORDER.indexOf(status.currentStep);

          if (savedIndex > backendIndex) {
            targetStep = savedStep;
          }
        }

        // Si on est déjà sur une étape valide (refresh), rester dessus si c'est cohérent
        if (currentRoute && SETUP_STEP_ORDER.includes(currentRoute)) {
          const currentRouteIndex = SETUP_STEP_ORDER.indexOf(currentRoute);
          const targetIndex = SETUP_STEP_ORDER.indexOf(targetStep);

          // Si l'étape courante est >= à l'étape cible, rester dessus
          if (currentRouteIndex >= targetIndex) {
            targetStep = currentRoute;
          }
        }

        // Mettre à jour le status avec l'étape finale
        const finalIndex = SETUP_STEP_ORDER.indexOf(targetStep);
        setupStatus.value.currentStep = targetStep;
        setupStatus.value.currentStepIndex = finalIndex;

        // Redirection seulement si nécessaire
        if (currentRoute !== targetStep) {
          await router.push(`/setup/${targetStep}`);
        }
      }
    } catch (err: any) {
      error.value = err.message ?? t('setup_store.status_error');

      // En cas d'erreur API, initialiser avec l'étape courante
      const currentStep = route.params.step as SetupStep;
      if (currentStep && SETUP_STEP_ORDER.includes(currentStep)) {
        initializeLocalSetupStatus(currentStep);
      } else {
        initializeLocalSetupStatus(SetupStep.WELCOME);
      }
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

    const currentStep = setupStatus.value!.currentStep;
    const currentIndex = SETUP_STEP_ORDER.indexOf(currentStep);
    const nextStep = SETUP_STEP_ORDER[currentIndex + 1];

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

    const currentStep = setupStatus.value!.currentStep;
    const currentIndex = SETUP_STEP_ORDER.indexOf(currentStep);
    const prevStep = SETUP_STEP_ORDER[currentIndex - 1];

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

  const initializeLocalSetupStatus = (
    currentStep: SetupStep = SetupStep.WELCOME,
  ) => {
    if (!setupStatus.value) {
      const currentIndex = SETUP_STEP_ORDER.indexOf(currentStep);
      setupStatus.value = {
        isFirstSetup: true,
        hasAdminUser: false,
        hasRooms: resources.rooms.length > 0,
        hasUps: resources.upsList.length > 0,
        hasServers: resources.servers.length > 0,
        currentStep,
        currentStepIndex: currentIndex >= 0 ? currentIndex : 0,
        totalSteps: SETUP_STEP_ORDER.length,
      };
    }
  };

  const updateLocalProgress = () => {
    if (!setupStatus.value) return;

    setupStatus.value.hasRooms = resources.rooms.length > 0;
    setupStatus.value.hasUps = resources.upsList.length > 0;
    setupStatus.value.hasServers = resources.servers.length > 0;

    // Mise à jour automatique de l'étape si des ressources ont été ajoutées
    const currentIndex = SETUP_STEP_ORDER.indexOf(
      setupStatus.value.currentStep,
    );
    let suggestedStep = setupStatus.value.currentStep;

    // Si on est encore à la planification et qu'on a des ressources, avancer automatiquement
    if (currentIndex <= SETUP_STEP_ORDER.indexOf(SetupStep.RESOURCE_PLANNING)) {
      if (
        resources.rooms.length > 0 &&
        currentIndex < SETUP_STEP_ORDER.indexOf(SetupStep.ROOMS_CONFIG)
      ) {
        suggestedStep = SetupStep.ROOMS_CONFIG;
      } else if (
        resources.upsList.length > 0 &&
        currentIndex < SETUP_STEP_ORDER.indexOf(SetupStep.UPS_CONFIG)
      ) {
        suggestedStep = SetupStep.UPS_CONFIG;
      } else if (
        resources.servers.length > 0 &&
        currentIndex < SETUP_STEP_ORDER.indexOf(SetupStep.SERVERS_CONFIG)
      ) {
        suggestedStep = SetupStep.SERVERS_CONFIG;
      }
    }

    if (suggestedStep !== setupStatus.value.currentStep) {
      const newIndex = SETUP_STEP_ORDER.indexOf(suggestedStep);
      setupStatus.value.currentStep = suggestedStep;
      setupStatus.value.currentStepIndex = newIndex;
      saveCurrentStep(suggestedStep);
    }
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

    const roomIdMapping: { [oldId: string]: string } = {};
    template.configuration.rooms?.forEach((roomTemplate) => {
      const newRoom = addRoom(roomTemplate);
      if (roomTemplate.tempId) {
        roomIdMapping[roomTemplate.tempId] = newRoom.id;
      }
    });

    template.configuration.upsList?.forEach((upsTemplate) => {
      const updatedUps = { ...upsTemplate };
      if (upsTemplate.roomId && roomIdMapping[upsTemplate.roomId]) {
        updatedUps.roomId = roomIdMapping[upsTemplate.roomId];
      }
      addUps(updatedUps);
    });

    template.configuration.servers?.forEach((serverTemplate) => {
      const updatedServer = { ...serverTemplate };
      if (serverTemplate.roomId && roomIdMapping[serverTemplate.roomId]) {
        updatedServer.roomId = roomIdMapping[serverTemplate.roomId];
      }
      addServer(updatedServer);
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
    discoverySessionId,
    vmwareDiscoveryEnabled,

    isInSetupMode,
    progress,
    canGoNext,
    canGoPrev,
    getResourcesCount,
    hasResources,
    hasVmwareServers,

    checkSetupStatus,
    saveStepData,
    getStepData,
    completeCurrentStep,
    completeVmDiscovery,
    goToNextStep,
    goToPrevStep,
    skipSetup,
    resetSetup,
    initializeLocalSetupStatus,
    updateLocalProgress,
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
