import { computed } from 'vue';
import { useSetupFlow } from './useSetupFlow';
import { useSetupStore } from '../store';

export const useSetupProgress = () => {
  const { currentStepIndex, stepOrder } = useSetupFlow();
  const setupStore = useSetupStore();

  const progress = computed(() => {
    // Utilise le calcul du store pour la cohérence
    return setupStore.progress;
  });

  const progressText = computed(() => {
    const currentStep = currentStepIndex.value + 1;
    return `${currentStep}/${stepOrder.length}`;
  });

  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(
    () => currentStepIndex.value === stepOrder.length - 1,
  );

  return {
    progress,
    progressText,
    isFirstStep,
    isLastStep,
  };
};
