<template>
    <header class="setup-header">
        <div class="setup-header__content">
            <div class="setup-header__logo">
                <Server :size="28" />
                <span>{{ t('setup.header_title') }}</span>
            </div>

            <div class="setup-header__progress">
                <span>{{ progressText }}</span>
                <div class="progress-bar">
                    <div class="progress-bar__fill" :style="{ width: `${progress}%` }" />
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Server } from 'lucide-vue-next';
import type { SetupStep } from '../types';


interface Props {
    progress: number;
    currentStep?: SetupStep;
}

const props = defineProps<Props>();

const { t } = useI18n();
const progressText = computed(() => {
    return t('setup.progress', { progress: Math.round(props.progress) });
});
</script>

<style lang="scss" scoped>
.progress-bar {
    width: 150px;
    height: 6px;
    background: #E5E7EB;
    border-radius: 3px;
    overflow: hidden;

    &__fill {
        height: 100%;
        background: #2563EB;
        transition: width 0.3s ease;
    }
}
</style>