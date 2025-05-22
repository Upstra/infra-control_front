<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store'
import { useToast } from 'vue-toast-notification'
import TwoFACodeInput from './TwoFACodeInput.vue'
import { handle2FASuccess } from '@/router'

import RecoveryCodesCard from './RecoveryCodesCard.vue'

const store = useAuthStore()
const toast = useToast()

const error = ref<string | null>(null)
const loading = ref(false)
const codeInputRef = ref()
const recoveryCode = ref('')
const recoveryMode = ref(false)
const showRecovery = ref(false)

const toggleMode = () => {
  error.value = null
  recoveryCode.value = ''
  recoveryMode.value = !recoveryMode.value
}

const handleCode = async (code: string) => {
  error.value = null
  loading.value = true
  try {
    await store.verifyTwoFA({ code })

    if (store.recoveryCodes.length > 0) {
      showRecovery.value = true 
    } else {
      handle2FASuccess()
    }
  } catch (err: any) {
    error.value = err.message
    codeInputRef.value?.triggerShake()
    toast.error('Code 2FA invalide.')
  } finally {
    loading.value = false
  }
}
const handleRecovery = async (code: string) => {
  error.value = null
  loading.value = true
  try {
    const recoveryCode = code.toUpperCase()
    console.log('Recovery Code:', recoveryCode)
    await store.verifyTwoFARecovery({ recoveryCode })
    handle2FASuccess()
  } catch (err: any) {
    error.value = err.message
    codeInputRef.value?.triggerShake()
    toast.error('Code de récupération invalide.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center px-4 py-20 bg-neutral-light">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-neutral-200">

      <template v-if="showRecovery">
        <RecoveryCodesCard
          :codes="store.recoveryCodes"
          :on-validate="handle2FASuccess"
        />
      </template>

      <template v-else>
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-neutral-darker">
            Vérification 2FA
          </h1>
          <p class="text-sm text-neutral-dark mt-1">
            {{ recoveryMode
              ? 'Entrez un code de récupération'
              : 'Saisis le code généré par ton application 2FA' }}
          </p>
        </div>

        <form @submit.prevent class="space-y-6">
          <div v-if="!recoveryMode">
            <label class="block text-sm text-neutral-dark mb-2">Code à 6 chiffres</label>
            <TwoFACodeInput inputMode="numeric" :length="6" @complete="handleCode" />
          </div>

          <div v-else>
            <label class="block text-sm text-neutral-dark mb-2">Code de récupération</label>
            <TwoFACodeInput
              inputMode="text"
              :length="8"
              :placeholder="'VJC7SKSP'"
              :separator="[4]"
              @complete="handleRecovery"
            />
          </div>

          <div v-if="error" class="text-danger text-sm text-center">
            {{ error }}
          </div>
        </form>

        <div class="text-center mt-6">
          <button
            type="button"
            class="text-sm text-primary hover:underline"
            @click="toggleMode"
          >
            {{ recoveryMode
              ? 'Revenir à la saisie 2FA classique'
              : 'Je n’ai plus accès à mon application 2FA' }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>