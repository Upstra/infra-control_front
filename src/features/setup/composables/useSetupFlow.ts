import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SetupStep, SETUP_STEP_ORDER } from '../types';
import { useSetupStore } from '../store';

export const useSetupFlow = () => {
  const router = useRouter();
  const route = useRoute();
  const setupStore = useSetupStore();

  const currentStep = computed(() => {
    return (
      (route.params.step as SetupStep) || setupStore.setupStatus?.currentStep
    );
  });

  const stepOrder = SETUP_STEP_ORDER;

  const currentStepIndex = computed(() => {
    return stepOrder.indexOf(currentStep.value);
  });

  const nextStep = computed(() => {
    const nextIndex = currentStepIndex.value + 1;
    return nextIndex < stepOrder.length ? stepOrder[nextIndex] : null;
  });

  const previousStep = computed(() => {
    const prevIndex = currentStepIndex.value - 1;
    return prevIndex >= 0 ? stepOrder[prevIndex] : null;
  });

  const goToStep = async (step: SetupStep) => {
    await router.push(`/setup/${step}`);
  };

  const goNext = async () => {
    if (nextStep.value) {
      await goToStep(nextStep.value);
    }
  };

  const goPrevious = async () => {
    if (previousStep.value) {
      await goToStep(previousStep.value);
    }
  };

  return {
    currentStep,
    currentStepIndex,
    nextStep,
    previousStep,
    stepOrder,
    goToStep,
    goNext,
    goPrevious,
  };
};
