<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../store'
import { Check, Copy } from 'lucide-vue-next'

const store = useAuthStore()
const alreadyEnabled = ref(false)
const copied = ref(false)

onMounted(async () => {
  await store.fetchTwoFAStatus()
  if (store.isTwoFactorEnabled) {
    alreadyEnabled.value = true
  } else {
    const success = await store.generateQrCode()
    alreadyEnabled.value = !success
  }
})

const handleCopy = async () => {
  if (!store.qrData?.setupKey) return
  await navigator.clipboard.writeText(store.qrData.setupKey)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl border border-neutral-200 shadow-lg">
    <h2 class="text-2xl font-bold text-center text-neutral-darker">Activer la double authentification</h2>

    <div v-if="alreadyEnabled" class="text-center text-sm text-danger">
      ⚠️ Le 2FA est déjà activé pour votre compte.
    </div>

    <div v-else-if="store.qrData" class="text-center space-y-5">
      <img :src="store.qrData.qrCode" alt="QR Code" class="mx-auto w-48 h-48" />
      <p class="text-sm text-neutral-dark">
        Veuillez scanner ce code avec ton application 2FA (Google Authenticator, Authy…)
      </p>

      <!-- Clé secrète manuelle avec bouton copier -->
      <div class="space-y-2 text-left">
        <label for="setup-key" class="block text-sm text-neutral-dark">Clé secrète manuelle</label>
        <div class="relative">
          <input
            id="setup-key"
            :value="store.qrData.setupKey"
            readonly
            class="w-full pr-10 px-4 py-2 text-sm font-mono border rounded-lg bg-neutral-100 text-neutral-darker cursor-default select-all"
          />
          <button
            @click="handleCopy"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary transition"
          >
            <component :is="copied ? Check : Copy" class="w-5 h-5" />
          </button>
        </div>
        <p class="text-xs text-neutral-500">
          Vous pouvez entrer cette clé dans votre application 2FA si tu vous ne pouvez pas scanner le QR code.
        </p>
      </div>
    </div>

    <div v-else class="text-center text-sm text-neutral-400">
      Chargement du QR Code...
    </div>
  </div>
</template>
