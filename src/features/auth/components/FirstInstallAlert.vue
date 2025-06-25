<template>
    <div role="alert"
        class="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-2xl mb-8 flex gap-4 items-start transition-opacity duration-200">
        <Rocket :size="24" />
        <div>
            <h3 class="text-lg font-semibold mb-2">{{ t('auth.first_install.title') }}</h3>
            <p class="opacity-90 mb-4">
                {{ t('auth.first_install.desc') }}
            </p>
            <router-link to="/register"
                class="inline-flex items-center gap-1 font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-white">
                {{ t('auth.first_install.cta') }}
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Rocket } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
