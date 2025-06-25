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
import { useI18n } from 'vue-i18n';

import SetupHeader from '../components/SetupHeader.vue';
import SetupStepper from '../components/SetupStepper.vue';
import SetupNavigation from '../components/SetupNavigation.vue';
import { SetupStep } from '../types';
import { useSetupStore } from '../store';

const setupStore = useSetupStore();
const { t } = useI18n();

const steps = computed(() => [
    { id: SetupStep.WELCOME, label: t('setup.step_welcome'), icon: 'hand-wave' },
    { id: SetupStep.CREATE_ROOM, label: t('setup.step_create_room'), icon: 'building-office' },
    { id: SetupStep.CREATE_UPS, label: t('setup.step_create_ups'), icon: 'battery-charging' },
    { id: SetupStep.CREATE_SERVER, label: t('setup.step_create_server'), icon: 'server' },
    { id: SetupStep.COMPLETE, label: t('setup.step_complete'), icon: 'check-circle' },
]);

const currentStep = computed(() => setupStore.setupStatus?.currentStep);
const isLoading = computed(() => setupStore.isLoading);

const handleNext = () => {
    setupStore.goToNextStep();
};

const handleSkip = () => {
    if (confirm(t('setup.confirm_skip'))) {
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