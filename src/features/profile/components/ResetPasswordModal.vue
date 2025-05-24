<script setup lang="ts">
import { ref, watch } from 'vue'
import { LockClosedIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useUsers } from '@/features/users/composables/useUsers'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['close', 'success'])

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')

const { resetCurrentUserPassword } = useUsers()

watch([password, confirm], () => {
    errorMsg.value =
        password.value && confirm.value && password.value !== confirm.value
            ? 'Les mots de passe ne correspondent pas'
            : ''
})

const handleSubmit = async () => {
    if (errorMsg.value || !password.value) return
    loading.value = true
    errorMsg.value = ''
    try {
        await resetCurrentUserPassword(password.value)
        emit('success')
        password.value = confirm.value = ''
        emit('close')
    } catch (e: any) {
        errorMsg.value =
            e?.response?.data?.message?.[0] ?? e?.message ?? 'Erreur inattendue'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <transition name="fade">
        <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" @keydown.esc="emit('close')">
                <button class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600" @click="emit('close')">
                    <XMarkIcon class="w-5 h-5" />
                </button>
                <div class="mb-6 flex flex-col items-center gap-2">
                    <LockClosedIcon class="h-12 w-12 text-primary" />
                    <h3 class="text-xl font-semibold text-neutral-darker">Réinitialiser le mot&nbsp;de&nbsp;passe</h3>
                </div>
                <form class="space-y-4" @submit.prevent="handleSubmit">
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-neutral-darker">Nouveau mot de passe
                            <input v-model="password" type="password"
                                class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••" required />
                        </label>
                    </div>
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-neutral-darker">Confirmer
                            <input v-model="confirm" type="password"
                                class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••" required />
                        </label>
                    </div>
                    <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
                    <button type="submit" :disabled="loading || !!errorMsg"
                        class="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-white transition hover:bg-primary-dark disabled:opacity-50">
                        <span v-if="!loading">Enregistrer</span>
                        <svg v-else class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
                            <path d="M22 12A10 10 0 0012 2" fill="none" stroke="currentColor" stroke-width="4" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </transition>
</template>