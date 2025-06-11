<template>
    <div class="setup-container">
        <SetupHeader :progress="setupStore.progress" :current-step="currentStep" />

        <main class="setup-content">
            <SetupStepper :steps="steps" :current-step="currentStep" />

            <div class="setup-step">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>

            <SetupNavigation :can-go-prev="setupStore.canGoPrev" :can-go-next="setupStore.canGoNext"
                :is-loading="isLoading" @prev="setupStore.goToPrevStep" @next="handleNext" @skip="handleSkip" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import SetupHeader from '../components/SetupHeader.vue';
import SetupStepper from '../components/SetupStepper.vue';
import SetupNavigation from '../components/SetupNavigation.vue';
import { SetupStep } from '../types';
import { useSetupStore } from '../store';

const setupStore = useSetupStore();

const steps = [
    {
        id: SetupStep.WELCOME,
        label: 'Bienvenue',
        icon: 'hand-wave',
    },
    {
        id: SetupStep.CREATE_ROOM,
        label: 'Créer une salle',
        icon: 'building-office',
    },
    {
        id: SetupStep.CREATE_UPS,
        label: 'Ajouter un onduleur',
        icon: 'battery-charging',
    },
    {
        id: SetupStep.CREATE_SERVER,
        label: 'Ajouter un serveur',
        icon: 'server',
    },
    {
        id: SetupStep.COMPLETE,
        label: 'Terminé',
        icon: 'check-circle',
    },
];

const currentStep = computed(() => setupStore.setupStatus?.currentStep);
const isLoading = computed(() => setupStore.isLoading);

const handleNext = () => {
    setupStore.goToNextStep();
};

const handleSkip = () => {
    if (confirm('Êtes-vous sûr de vouloir passer la configuration guidée ?')) {
        setupStore.skipSetup();
    }
};

onMounted(() => {
    setupStore.checkSetupStatus();
});
</script>

<style lang="scss">
@import '../styles/setup.scss';

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>