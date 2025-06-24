<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { io, Socket } from 'socket.io-client'

const props = withDefaults(
  defineProps<{
    ip?: string
    username?: string
    password?: string
  }>(),
  {
    ip: '192.168.1.100',
    username: 'root',
    password: 'secret',
  }
)

const terminalEl = ref<HTMLDivElement | null>(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: Socket | null = null

function onResize() {
  fitAddon?.fit()
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
  <div
    class="rounded-xl border border-neutral-light bg-neutral-dark shadow-md overflow-hidden"
  >
    <div class="flex items-center gap-2 px-3 py-2 bg-neutral-light/60">
      <span class="w-3 h-3 rounded-full bg-red-500"></span>
      <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
      <span class="w-3 h-3 rounded-full bg-green-500"></span>
    </div>
    <div ref="terminalEl" class="w-full h-96 bg-black text-neutral-light" />
  </div></template>

<style scoped>
.xterm {
  padding: 0.5rem;
  font-size: 0.875rem;
  font-family: monospace;
}
</style>