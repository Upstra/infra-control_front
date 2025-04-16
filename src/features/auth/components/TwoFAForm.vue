<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store'
import TwoFACodeInput from './TwoFACodeInput.vue'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const store = useAuthStore()
const error = ref<string | null>(null)
const loading = ref(false)

const codeInputRef = ref()

const emit = defineEmits(['success'])

const handleCode = async (code: string) => {
  error.value = null;
  loading.value = true;
  try {
    await store.verifyTwoFA({ code });
    emit('success') 
  } catch (err: any) {
    console.error('Erreur de vérification 2FA:', err);
    error.value = err.message;
    codeInputRef.value?.triggerShake();
    toast.error('Erreur de vérification 2FA. Veuillez réessayer.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent class="space-y-6">
    <div class="text-center">
      <label for="two-fa-code" class="block text-sm text-neutral-dark mb-2">Code à 6 chiffres</label>
      <TwoFACodeInput id="two-fa-code" ref="codeInputRef" @complete="handleCode" />
    </div>

    <div v-if="error" class="text-danger text-sm text-center">
      {{ error }}
    </div>

    <button
      type="submit"
      disabled
      class="w-full py-2 bg-primary text-white rounded-lg font-medium opacity-60 cursor-not-allowed"
    >
      En attente du code...
    </button>
  </form>
</template>
