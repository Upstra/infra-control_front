<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

const emit = defineEmits<{
  (event: 'complete', code: string): void
}>()

const props = defineProps<{
  inputMode?: 'numeric' | 'text' | 'tel' | 'decimal' | 'none',
  length?: number,
  placeholder?: string,
  separator?: number[]
}>()

const code = ref<string[]>(Array(props.length ?? 6).fill(''))
const inputs = ref<HTMLInputElement[]>([])
const shake = ref(false)
let lastCode = ''

const reset = () => {
  code.value = Array(props.length ?? 6).fill('')
  nextTick(() => inputs.value[0]?.focus())
}

defineExpose({
  triggerShake: () => {
    shake.value = true
    setTimeout(() => {
      shake.value = false
    }, 600)
  },
  reset
})

onMounted(() => {
  nextTick(() => inputs.value[0]?.focus())
})

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

  if (!value) return

  const chars = value.slice(0, code.value.length - index).split('')
  for (let i = 0; i < chars.length; i++) {
    code.value[index + i] = chars[i]
  }

  const nextIndex = index + chars.length
  if (nextIndex < code.value.length) {
    inputs.value[nextIndex]?.focus()
  } else {
    inputs.value[code.value.length - 1]?.blur()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  let pasted = event.clipboardData?.getData('text') ?? ''
  pasted = pasted.trim()
  if (props.inputMode === 'numeric') pasted = pasted.replace(/\D/g, '')
  const chars = pasted.slice(0, code.value.length).split('')
  code.value = [...chars, ...Array(code.value.length - chars.length).fill('')]
  nextTick(() => {
    if (inputs.value[chars.length]) {
      inputs.value[chars.length].focus()
    } else {
      inputs.value[code.value.length - 1]?.blur()
    }
  })
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  if (event.key === 'Backspace' && !target.value && index > 0) {
    code.value[index - 1] = ''
    inputs.value[index - 1]?.focus()
  }
}

const getCharAt = (index: number) =>
  props.placeholder?.charAt(index) || ''
</script>

<template>
  <div class="flex flex-col items-center gap-4" @paste="handlePaste">
    <div class="flex justify-center gap-2" :class="{ 'animate-shake': shake }">
      <template v-for="i in props.length ?? 6" :key="i">
        <input
          v-model="code[i - 1]"
          type="text"
          :inputmode="props.inputMode ?? 'numeric'"
          maxlength="1"
          autocomplete="off"
          class="w-12 h-12 text-center text-xl border rounded-lg font-mono bg-white outline-none transition focus:ring-2 focus:ring-primary"
          @input="handleInput(i - 1, $event)"
          @keydown="handleKeydown(i - 1, $event)"
          :placeholder="getCharAt(i - 1)"
          ref="inputs"
        />
        <span
          v-if="props.separator?.includes(i)"
          class="text-xl font-bold text-neutral-dark self-center select-none"
        >-</span>
      </template>
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
