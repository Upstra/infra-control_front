<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { io, Socket } from 'socket.io-client'

const terminalEl = ref<HTMLDivElement | null>(null)
let term: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: Socket | null = null

const ip = '192.168.1.100'
const username = 'root'
const password = 'secret'

onMounted(() => {
  term = new Terminal({ cursorBlink: true })
  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(terminalEl.value!)
  fitAddon.fit()

  socket = io(`${import.meta.env.VITE_WS_URL}/ssh`, {
    auth: { ip, username, password },
  })

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
  socket?.disconnect()
  term?.dispose()
})
</script>

<template>
  <div ref="terminalEl" class="w-full h-96 bg-black" />
</template>

<style scoped>
.xterm {
  padding: 0.5rem;
  font-size: 14px;
}
</style>