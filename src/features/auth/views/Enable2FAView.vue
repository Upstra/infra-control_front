<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../store'
import { Check, Copy } from 'lucide-vue-next'
import TwoFAForm from '../components/TwoFAForm.vue'
import RecoveryCodesCard from '../components/RecoveryCodesCard.vue'
import { handle2FASuccess } from '@/router'
import { useI18n } from 'vue-i18n'

const store = useAuthStore()
const alreadyEnabled = ref(false)
const copied = ref(false)
const showRecoveryCodes = ref(false)
const { t } = useI18n()

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

const handleShowRecovery = () => {
  if (store.recoveryCodes?.length > 0) {
    showRecoveryCodes.value = true
  } else {
    handle2FASuccess()
  }
}
</script>

<template>
  <div class="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl border border-neutral-200 shadow-lg">
    <h2 class="text-2xl font-bold text-center text-neutral-darker">{{ t('auth.enable2fa.title') }}</h2>

    <div v-if="alreadyEnabled" class="text-center text-sm text-danger">
      {{ t('auth.enable2fa.already_enabled') }}
    </div>

    <template v-else>
      <RecoveryCodesCard
        v-if="showRecoveryCodes"
        :codes="store.recoveryCodes"
        :on-validate="handle2FASuccess"
      />

      <div v-else-if="store.qrData" class="text-center space-y-5">
        <img :src="store.qrData.qrCode" alt="QR Code" class="mx-auto w-48 h-48" />
        <p class="text-sm text-neutral-dark">
          {{ t('auth.enable2fa.scan_instruction') }}
        </p>

        <div class="space-y-2 text-left">
          <label for="setup-key" class="block text-sm text-neutral-dark">{{ t('auth.enable2fa.manual_key') }}</label>
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
            {{ t('auth.enable2fa.manual_hint') }}
          </p>
        </div>

        <TwoFAForm @success="handleShowRecovery" />
      </div>

      <div v-else class="text-center text-sm text-neutral-400">
        {{ t('auth.enable2fa.loading_qr') }}
      </div>
    </template>
  </div>
</template>
