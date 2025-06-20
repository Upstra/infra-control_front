<template>
    <div class="setup-stepper">
        <div class="setup-stepper__list">
            <div v-for="(step, index) in steps" :key="step.id" :class="[
                'setup-stepper__item',
                {
                    'setup-stepper__item--active': step.id === currentStep,
                    'setup-stepper__item--completed': isStepCompleted(index)
                }
            ]">
                <div class="setup-stepper__icon">
                    <CheckIcon v-if="isStepCompleted(index)" :size="20" />
                    <component v-else :is="getIconComponent(step.icon)" :size="20" />
                </div>
                <span class="setup-stepper__label">{{ step.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    Check as CheckIcon,
    HandMetal,
    Building2,
    BatteryCharging,
    Server,
    CheckCircle
} from 'lucide-vue-next';
import type { SetupStep } from '../types';

interface StepConfig {
    id: SetupStep;
    label: string;
    icon: string;
}

interface Props {
    steps: StepConfig[];
    currentStep?: SetupStep;
}

const props = defineProps<Props>();

const iconMap = {
    'hand-wave': HandMetal,
    'building-office': Building2,
    'battery-charging': BatteryCharging,
    'server': Server,
    'check-circle': CheckCircle,
};

const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Server;
};

const currentStepIndex = computed(() => {
    return props.steps.findIndex(step => step.id === props.currentStep);
});

const isStepCompleted = (index: number) => {
    return index < currentStepIndex.value;
};
</script>