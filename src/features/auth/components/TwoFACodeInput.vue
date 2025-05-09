<script setup lang="ts">
import { ref, onMounted, nextTick, watchEffect } from 'vue'

const emit = defineEmits<(e: 'complete', code: string) => void>()

const code = ref<string[]>(Array(6).fill(''))
const inputs = ref<HTMLInputElement[]>([])
const timer = ref(59)
const shake = ref(false)

let interval: ReturnType<typeof setInterval>


onMounted(() => {
  nextTick(() => inputs.value[0]?.focus())
  startTimer()
})

const startTimer = () => {
  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(interval)
    }
  }, 1000)
}
watchEffect(() => {
  if (code.value.every((digit) => digit !== '')) {
    emit('complete', code.value.join(''))
  }
})


const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 1);
  code.value[index] = value
  if (value && index < 5) {
    inputs.value[index + 1]?.focus()
  }
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  if (event.key === 'Backspace' && !target.value && index > 0) {
    code.value[index - 1] = ''
    inputs.value[index - 1]?.focus()
  }
}

defineExpose({
  triggerShake: () => {
    shake.value = true
    setTimeout(() => {
      shake.value = false
    }, 600)
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="flex justify-center gap-2" :class="{ 'animate-shake': shake }">
      <input
        v-for="(_, i) in code"
        :key="i"
        type="text"
        inputmode="numeric"
        maxlength="1"
        autocomplete="off"
        class="w-12 h-12 text-center text-xl border rounded-lg font-mono bg-white outline-none transition focus:ring-2 focus:ring-primary"
        v-model="code[i]"
        @input="handleInput(i, $event)"
        @keydown="handleKeydown(i, $event)"
        ref="inputs"
      />
    </div>

    <div class="text-sm text-neutral-dark tracking-wide">
      Code expirant dans :
      <span class="font-semibold tabular-nums">{{ String(timer).padStart(2, '0') }}s</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.4s ease;
}
</style>
