import { computed } from "vue";
import { useSetupFlow } from "./useSetupFlow";

export const useSetupProgress = () => {
  const { currentStepIndex, stepOrder } = useSetupFlow();

  const progress = computed(() => {
    const totalSteps = stepOrder.length;
    const completedSteps = currentStepIndex.value;
    return Math.round((completedSteps / (totalSteps - 1)) * 100);
  });

  const progressText = computed(() => {
    return `Étape ${currentStepIndex.value + 1} sur ${stepOrder.length}`;
  });

  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(
    () => currentStepIndex.value === stepOrder.length - 1
  );

  return {
    progress,
    progressText,
    isFirstStep,
    isLastStep,
  };
};
