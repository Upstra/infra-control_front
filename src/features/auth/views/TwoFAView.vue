<script setup lang="ts">
import TwoFAForm from '../components/TwoFAForm.vue'
import { handle2FASuccess } from '@/router'

</script>

<template>
  <div class="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-200">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-darker">Vérification 2FA</h1>
        <p class="text-sm text-neutral-dark mt-1">Saisis le code généré par ton application 2FA</p>
      </div>

      <TwoFAForm @success="handle2FASuccess" />
    </div>
  </div>
</template>
