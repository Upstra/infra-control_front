<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { io, Socket } from 'socket.io-client'
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    ip?: string
    username?: string
    password?: string
  }>(),
  {
    ip: '152.23.40.1',
    username: 'upstra',
    password: 'notTheRealPassword',
  }
)

const terminalEl = ref<HTMLDivElement | null>(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: Socket | null = null
const isFullscreen = ref(false)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'fullscreen', value: boolean): void
}>()

const containerClasses = computed(() => [
  'rounded-xl border border-neutral-light bg-neutral-dark shadow-md overflow-hidden',
  isFullscreen.value && 'fixed inset-0 z-50 flex flex-col',
])

const terminalClasses = computed(() => [
  'w-full text-neutral-light',
  isFullscreen.value ? 'flex-1 h-full' : 'h-96',
])


function onResize() {
  fitAddon?.fit()
}

function handleClose() {
  socket?.disconnect()
  term?.dispose()
  window.removeEventListener('resize', onResize)
  emit('close')
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => fitAddon?.fit())
  emit('fullscreen', isFullscreen.value)
}


onMounted(() => {
  term = new Terminal({ cursorBlink: true })
  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(terminalEl.value!)
  fitAddon.fit()

  socket = io(`${import.meta.env.VITE_WS_URL}/ssh`, {
    auth: { ip: props.ip, username: props.username, password: props.password },
  })

  window.addEventListener('resize', onResize)


  socket.on('connect', () => {
    term?.writeln('Connected to SSH server')
  })

  socket.on('ssh:data', (data: string) => {
    term?.write(data)
  })

  socket.on('disconnect', () => {
    term?.writeln('\r\nDisconnected')
  })

  term.onData(d => {
    socket?.emit('ssh:data', d)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  socket?.disconnect()
  term?.dispose()
})
</script>

<template>
  <div :class="containerClasses">
    <div class="flex items-center gap-2 px-3 py-2 bg-neutral-light/60">
      <button class="flex items-center justify-center w-3 h-3 rounded-full bg-red-500 text-dark group"
        @click="handleClose">
        <span class="relative">
          <XMarkIcon class="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </span>
      </button>
      <span class="w-3 h-3 rounded-full bg-yellow-500" />
      <button class="flex items-center justify-center w-3 h-3 rounded-full bg-green-500 text-dark"
        @click="toggleFullscreen">
        <span class="group relative">
          <ArrowsPointingInIcon v-if="isFullscreen"
            class="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          <ArrowsPointingOutIcon v-else
            class="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </span>
      </button>
    </div>
    <div ref="terminalEl" :class="terminalClasses" />
  </div>
</template>

<style scoped>
.xterm {
  padding: 0.5rem;
  font-size: 0.875rem;
  font-family: monospace;
}
</style>