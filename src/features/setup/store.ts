import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { setupApi } from './api';
import { 
  SetupStep, 
  type SetupStatus, 
  type RoomCreationDto, 
  type UpsCreationDto, 
  type ServerCreationDto,
  type ImprovedSetupData,
  type BulkImportData,
  type SetupTemplate
} from './types';

let tempIdCounter = 0;
const generateTempId = () => `temp_${Date.now()}_${tempIdCounter++}`;

export const useSetupStore = defineStore('setup', () => {
  const router = useRouter();
  const { t } = useI18n();

  const setupStatus = ref<SetupStatus | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentStepData = ref<Record<string, any>>({});

  const resources = reactive<ImprovedSetupData>({
    rooms: [],
    upsList: [],
    servers: [],
    templates: {
      roomTemplates: [],
      serverTemplates: []
    }
  });

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

  const addRoom = (room: Partial<RoomCreationDto>) => {
    const newRoom = { ...room, id: generateTempId() } as RoomCreationDto & { id: string };
    resources.rooms.push(newRoom);
    return newRoom;
  };

  const updateRoom = (id: string, updates: Partial<RoomCreationDto>) => {
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
      const newRoom = { ...room, id: generateTempId(), name: `${room.name} (Copy)` };
      resources.rooms.push(newRoom);
      return newRoom;
    }
  };

  const addUps = (ups: Partial<UpsCreationDto>) => {
    const newUps = { ...ups, id: generateTempId() } as UpsCreationDto & { id: string };
    resources.upsList.push(newUps);
    return newUps;
  };

  const updateUps = (id: string, updates: Partial<UpsCreationDto>) => {
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
      const newUps = { ...ups, id: generateTempId(), name: `${ups.name} (Copy)` };
      resources.upsList.push(newUps);
      return newUps;
    }
  };

  const addServer = (server: Partial<ServerCreationDto>) => {
    const newServer = { ...server, id: generateTempId() } as ServerCreationDto & { id: string };
    resources.servers.push(newServer);
    return newServer;
  };

  const updateServer = (id: string, updates: Partial<ServerCreationDto>) => {
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
      const newServer = { ...server, id: generateTempId(), name: `${server.name} (Copy)` };
      resources.servers.push(newServer);
      return newServer;
    }
  };

  const importConfiguration = async (data: BulkImportData) => {
    try {
      data.rooms?.forEach(room => addRoom({
        ...room,
        coolingType: room.coolingType as 'air' | 'liquid' | 'free' | 'hybrid'
      }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || t('setup_store.import_error'));
    }
  };

  const applyConfiguration = async () => {
    try {
      const promises = [];
      
      for (const room of resources.rooms) {
        promises.push(setupApi.createRoom(room));
      }
      
      for (const ups of resources.upsList) {
        promises.push(setupApi.createUps(ups));
      }
      
      for (const server of resources.servers) {
        promises.push(setupApi.createServer(server));
      }
      
      await Promise.all(promises);
      
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || t('setup_store.apply_error'));
    }
  };

  const clearResources = () => {
    resources.rooms = [];
    resources.upsList = [];
    resources.servers = [];
  };

  const getResourcesCount = computed(() => ({
    rooms: resources.rooms.length,
    ups: resources.upsList.length,
    servers: resources.servers.length,
    total: resources.rooms.length + resources.upsList.length + resources.servers.length
  }));

  const hasResources = computed(() => getResourcesCount.value.total > 0);

  const checkSetupStatus = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const status = await setupApi.getStatus();
      setupStatus.value = status;

      if (status && status.currentStepIndex < status.totalSteps) {
        await router.push(`/setup/${status.currentStep}`);
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

    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(setupStatus.value!.currentStep);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      await router.push(`/setup/${nextStep}`);
    }
  };

  const goToPrevStep = async () => {
    if (!canGoPrev.value) return;

    const steps = Object.values(SetupStep);
    const currentIndex = steps.indexOf(setupStatus.value!.currentStep);
    const prevStep = steps[currentIndex - 1];

    if (prevStep) {
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
      if (status.currentStep && status.currentStep !== SetupStep.VM_DISCOVERY)
        await router.push(`/setup/${status.currentStep}`);
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

  const applyTemplate = (template: SetupTemplate) => {
    if (template.configuration.quickSetups && template.configuration.quickSetups.length > 0) {
      const quickSetup = template.configuration.quickSetups[0];
      
      for (let i = 0; i < quickSetup.rooms; i++) {
        const room = addRoom({
          name: `Room ${i + 1}`,
          location: 'Main Building',
          capacity: quickSetup.serversPerRoom,
          coolingType: template.configuration.roomDefaults?.coolingType || 'air',
          ...template.configuration.roomDefaults
        });
        
        for (let j = 0; j < quickSetup.upsPerRoom; j++) {
          addUps({
            name: `UPS ${i + 1}-${j + 1}`,
            brand: 'APC',
            model: 'Smart-UPS',
            capacity: 3000,
            roomId: room.id,
            ...template.configuration.upsDefaults
          });
        }
        
        for (let k = 0; k < quickSetup.serversPerRoom; k++) {
          addServer({
            name: `Server ${i + 1}-${k + 1}`,
            state: 'active',
            grace_period_on: 30,
            grace_period_off: 30,
            adminUrl: '',
            ip: `192.168.${i + 1}.${k + 10}`,
            login: '',
            password: '',
            type: 'physical',
            priority: 1,
            roomId: room.id,
            ...template.configuration.serverDefaults
          });
        }
      }
    }
  };

  const PREDEFINED_TEMPLATES: SetupTemplate[] = [
    {
      name: 'Small Business',
      description: 'Basic setup for small businesses',
      configuration: {
        roomDefaults: {
          coolingType: 'air'
        },
        serverDefaults: {
          type: 'physical',
          priority: 1,
          grace_period_on: 30,
          grace_period_off: 30
        },
        quickSetups: [{
          name: 'Basic Setup',
          rooms: 1,
          serversPerRoom: 5,
          upsPerRoom: 1
        }]
      }
    },
    {
      name: 'Enterprise',
      description: 'Multi-site setup for enterprise deployments',
      configuration: {
        roomDefaults: {
          coolingType: 'liquid'
        },
        serverDefaults: {
          type: 'physical',
          priority: 2,
          grace_period_on: 60,
          grace_period_off: 60
        },
        quickSetups: [{
          name: 'Multi-Site Setup',
          rooms: 3,
          serversPerRoom: 20,
          upsPerRoom: 2
        }]
      }
    }
  ];

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
    
    importConfiguration,
    applyConfiguration,
    clearResources,
    applyTemplate,
    PREDEFINED_TEMPLATES
  };
});