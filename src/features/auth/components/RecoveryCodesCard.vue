<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const { codes, onValidate } = defineProps<{
  codes: string[]
  onValidate: () => void
}>()

const copied = ref(false)

const copyAll = async () => {
  await navigator.clipboard.writeText(codes.join('\n'))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="space-y-4 border-t pt-6">
    <h3 class="text-lg font-semibold text-center text-neutral-darker">
      🛡️ Vos codes de récupération
    </h3>
    <p class="text-sm text-neutral-dark text-center">
      Conservez-les précieusement. Ils vous permettent d'accéder à votre compte si vous perdez l'accès à votre app 2FA.
    </p>

    <ul class="grid grid-cols-2 gap-2 text-sm font-mono text-center">
      <li
        v-for="code in codes"
        :key="code"
        class="py-2 px-3 border rounded-lg bg-neutral-100 text-neutral-darker"
      >
        {{ code }}
      </li>
    </ul>

    <div class="flex justify-between items-center mt-4">
      <button
        @click="copyAll"
        class="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <component :is="copied ? Check : Copy" class="w-4 h-4" />
        {{ copied ? 'Copié !' : 'Copier tous les codes' }}
      </button>

      <button
        @click="onValidate"
        class="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition"
      >
        J’ai bien noté les codes
      </button>
    </div>
  </div>
</template>
