<template>
    <div class="min-h-screen relative">
        <div class="absolute top-6 right-6 z-10">
            <button @click="skipToLater"
                class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                :title="t('setup.skip_button_full')">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">{{ t('setup.skip_button_full') }}</span>
                <span class="block sm:hidden">{{ t('setup.skip_button_short') }}</span>
            </button>
        </div>

        <router-view />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const skipToLater = () => {
    localStorage.setItem('skipSetup', 'true')
    router.push('/dashboard')
}
</script>