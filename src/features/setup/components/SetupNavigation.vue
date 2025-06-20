<template>
    <div class="setup-navigation">
        <button type="button" class="setup-navigation__skip" @click="$emit('skip')" v-if="showSkip">
            Passer la configuration
        </button>

        <div class="setup-navigation__actions">
            <button type="button" class="setup-navigation__prev" :disabled="!canGoPrev" @click="$emit('prev')">
                <ArrowLeft :size="20" />
                Précédent
            </button>

            <button type="submit" class="setup-navigation__next" :disabled="!canGoNext || isLoading"
                @click="$emit('next')">
                <span v-if="isLoading" class="loading-spinner" />
                <span v-else>
                    {{ nextButtonText }}
                    <ArrowRight :size="20" />
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { SetupStep } from '../types';

interface Props {
    canGoPrev: boolean;
    canGoNext: boolean;
    isLoading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['prev', 'next', 'skip']);

const route = useRoute();

const currentStep = computed(() => {
    return route.params.step as SetupStep;
});

const showSkip = computed(() => {
    return currentStep.value !== SetupStep.COMPLETE;
});

const nextButtonText = computed(() => {
    if (isLoading.value) return '';

    switch (currentStep.value) {
        case SetupStep.WELCOME:
            return 'Commencer';
        case SetupStep.CREATE_SERVER:
            return 'Terminer';
        case SetupStep.COMPLETE:
            return 'Aller au tableau de bord';
        default:
            return 'Suivant';
    }
});

const isLoading = computed(() => props.isLoading);
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>