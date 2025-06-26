<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useUsers } from '@/features/users/composables/useUsers'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ open: boolean; username: string | undefined }>()
const emit = defineEmits(['close', 'success'])
const { t } = useI18n()

const usernameInput = ref('')
const loading = ref(false)
const errorMsg = ref('')
const router = useRouter()
const auth = useAuthStore()

const { deleteMeAccount } = useUsers();
const validUsername = computed(() => usernameInput.value === props?.username);

watch(
    [usernameInput],
    () => {
        errorMsg.value = ''
    },
    { immediate: true }
)

watch([validUsername],
    () => {
        errorMsg.value = ''
    },
    { immediate: true }
)

const handleSubmit = async () => {
    if (!validUsername.value) return
    loading.value = true
    errorMsg.value = ''
    try {
        await deleteMeAccount()
        emit('success')
        usernameInput.value = ''
        emit('close')
        auth.resetAuthState()
        router.push('/')
    } catch (e: any) {
        errorMsg.value = e?.response?.data?.message?.[0] ?? e?.message ?? t('profile.unexpected_error')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div class="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl" @keydown.esc="emit('close')">
                <button class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600" @click="emit('close')">
                    <XMarkIcon class="w-5 h-5" />
                </button>
                <div class="flex flex-col items-center gap-3 mb-6">
                    <ExclamationTriangleIcon class="h-12 w-12 text-red-500" />
                    <h3 class="text-2xl font-bold text-red-700">{{ t('profile.delete_account_title') }}</h3>
                    <p class="text-sm text-red-700 text-center">
                        {{ t('profile.delete_account_warning') }}
                    </p>
                </div>
                <form class="space-y-5" @submit.prevent="handleSubmit">
                    <div>
                        <label class="block text-sm font-medium text-neutral-darker mb-1">
                            {{ t('profile.confirm_username') }}
                            <span class="font-mono bg-neutral-100 px-2 py-0.5 rounded text-primary text-xs">{{
                                props?.username }}</span>
                            <input v-model="usernameInput" type="text" @paste.prevent @copy.prevent @cut.prevent
                                class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                autocomplete="off" :placeholder="t('profile.username_placeholder')" />
                        </label>
                    </div>
                    <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
                    <div class="flex gap-4 justify-end pt-2">
                        <button type="button" @click="emit('close')"
                            class="px-4 py-2 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition">
                            {{ t('profile.cancel') }}
                        </button>
                        <button type="submit" :disabled="!validUsername || loading"
                            class="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2">
                            <span v-if="!loading">{{ t('profile.delete_account') }}</span>
                            <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
                                <path d="M22 12A10 10 0 0012 2" fill="none" stroke="currentColor" stroke-width="4" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>