import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { setupApi } from "./api";
import { SetupStep, type SetupStatus } from "./types";

export const useSetupStore = defineStore("setup", () => {
  const router = useRouter();

  const setupStatus = ref<SetupStatus | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentStepData = ref<Record<string, any>>({});

  const createdResources = ref({
    room: null as any,
    ups: null as any,
    server: null as any,
  });

  const isInSetupMode = computed(
    () =>
      setupStatus.value?.isFirstSetup &&
      setupStatus.value?.currentStep !== SetupStep.COMPLETE
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
      error.value = err.message ?? "Erreur lors de la vérification du statut";
      console.error("Setup status error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const saveStepData = (step: SetupStep, data: any) => {
    currentStepData.value[step] = data;

    switch (step) {
      case SetupStep.CREATE_ROOM:
        createdResources.value.room = data;
        break;
      case SetupStep.CREATE_UPS:
        createdResources.value.ups = data;
        break;
      case SetupStep.CREATE_SERVER:
        createdResources.value.server = data;
        break;
    }

  };

  const getStepData = (step: SetupStep) => {
    return currentStepData.value[step] ?? {};
  };

  const getCreatedRoom = () => createdResources.value.room;
  const getCreatedUps = () => createdResources.value.ups;
  const getCreatedServer = () => createdResources.value.server;

  const completeCurrentStep = async () => {
    if (!setupStatus.value) {
      await checkSetupStatus();
      if (!setupStatus.value) {
        throw new Error("Impossible de récupérer le statut de configuration");
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
    localStorage.setItem("setup_skipped", "true");
    await router.push("/dashboard");
  };

  const resetSetup = () => {
    setupStatus.value = null;
    currentStepData.value = {};
    createdResources.value = {
      room: null,
      ups: null,
      server: null,
    };
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
      error.value =
        err.message ?? "Erreur lors de la complétion de la découverte";
    } finally {
      isLoading.value = false;
    }
  };

  const completeSetupStep = async (
    step: SetupStep,
    metadata?: Record<string, any>
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      await setupApi.completeStep(step, metadata);
      await checkSetupStatus();
    } catch (err: any) {
      error.value = err.message ?? "Erreur lors de la complétion de l'étape";
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
      error.value =
        err.message ?? "Erreur lors de la récupération de la progression";
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    setupStatus,
    isLoading,
    error,
    currentStepData,
    createdResources,

    isInSetupMode,
    progress,
    canGoNext,
    canGoPrev,

    checkSetupStatus,
    saveStepData,
    getStepData,
    getCreatedRoom,
    getCreatedUps,
    getCreatedServer,
    completeCurrentStep,
    completeVmDiscovery,
    goToNextStep,
    goToPrevStep,
    skipSetup,
    resetSetup,
    completeSetupStep,
    getSetupProgress,
  };
});
