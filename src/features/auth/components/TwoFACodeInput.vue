<script setup lang="ts">
import { ref, onMounted, nextTick, watch} from 'vue'

const emit = defineEmits<(e: 'complete', code: string) => void>()

const props = defineProps<{
  inputMode?: 'numeric' | 'text' | 'tel' | 'decimal' | 'none',
  length?: number,
  placeholder?: string,
  separator?: number[]
}>()


const code = ref<string[]>(Array(props.length ?? 6).fill(''))
const inputs = ref<HTMLInputElement[]>([])
const timer = ref(59)
const shake = ref(false)

let interval: ReturnType<typeof setInterval>
let lastCode = ''

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



watch(code, (newVal) => {
  const current = newVal.join('')
  if (newVal.every((digit) => digit !== '') && current !== lastCode) {
    lastCode = current
    emit('complete', current)
  }
}, { deep: true })

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  if (props.inputMode === 'numeric') {
    value = value.replace(/\D/g, '')
  }

  value = value.slice(0, 1)
  code.value[index] = value

  if (value && index < code.value.length - 1) {
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


const getCharAt = (index: number) =>
  props.placeholder?.charAt(index) || ''

</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="flex justify-center gap-2" :class="{ 'animate-shake': shake }">
      <template v-for="i in props.length ?? 6" :key="i">
        <input
          type="text"
          :inputmode="props.inputMode ?? 'numeric'"
          maxlength="1"
          autocomplete="off"
          class="w-12 h-12 text-center text-xl border rounded-lg font-mono bg-white outline-none transition focus:ring-2 focus:ring-primary"
          v-model="code[i - 1]"
          @input="handleInput(i - 1, $event)"
          @keydown="handleKeydown(i - 1, $event)"
          :placeholder="getCharAt(i - 1)"
          ref="inputs"
        />
        <span
          v-if="props.separator?.includes(i)"
          class="text-xl font-bold text-neutral-dark self-center select-none"
        >
          -
        </span>
      </template>
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
