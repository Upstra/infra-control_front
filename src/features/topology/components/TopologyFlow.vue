<script setup lang="ts">
import { ref, markRaw, onMounted, onBeforeUnmount } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type EdgeMouseEvent } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'

import RoomNode from '@/features/rooms/components/RoomNode.vue'
import ServerNode from '@/features/servers/components/ServerNode.vue'

const nodeTypes = {
  room: markRaw(RoomNode),
  server: markRaw(ServerNode),
}

const nodes = ref<Node[]>([
  { id: 'room-1', label: 'Salle A', position: { x: 100, y: 100 }, type: 'room', data: { name: 'Salle A' } },
  { id: 'room-2', label: 'Salle B', position: { x: 100, y: 300 }, type: 'room', data: { name: 'Salle B' } },

  { id: 'server-1', label: 'SRV-Paris-001', position: { x: 400, y: 100 }, type: 'server', data: { name: 'SRV-Paris-001' } },
  { id: 'server-2', label: 'SRV-Paris-002', position: { x: 400, y: 200 }, type: 'server', data: { name: 'SRV-Paris-002' } },
  { id: 'server-3', label: 'SRV-NYC-001', position: { x: 400, y: 300 }, type: 'server', data: { name: 'SRV-NYC-001' } },
  { id: 'server-4', label: 'SRV-Berlin-Alpha', position: { x: 400, y: 400 }, type: 'server', data: { name: 'SRV-Berlin-Alpha' } },
  { id: 'server-5', label: 'SRV-Tokyo-Zeta', position: { x: 400, y: 500 }, type: 'server', data: { name: 'SRV-Tokyo-Zeta' } },
  { id: 'server-6', label: 'SRV-MTL-Prod', position: { x: 400, y: 600 }, type: 'server', data: { name: 'SRV-MTL-Prod' } },
  { id: 'server-7', label: 'SRV-LDN-Beta', position: { x: 400, y: 700 }, type: 'server', data: { name: 'SRV-LDN-Beta' } },
])

const edges = ref<Edge[]>([])

const {
  addEdges,
  onConnect,
  onEdgeContextMenu,
  removeEdges,
  edges: currentEdges,
} = useVueFlow()

const isRoomToServer = (sourceId: string, targetId: string) => {
  return sourceId.startsWith('room-') && targetId.startsWith('server-')
}

onConnect((params) => {
  const { source, target } = params

  if (isRoomToServer(source, target)) {
    addEdges([params])
    console.log(`🔗 Le serveur ${target} est assigné à la salle ${source}`)
  } else {
    console.warn('❌ Lien invalide. Seuls les liens salle → serveur sont autorisés.')
  }
})

onEdgeContextMenu((params: EdgeMouseEvent) => {
  params.event.preventDefault()
  removeEdges(params.edge)
  console.log(`🗑️ Edge supprimé via clic droit : ${params.edge.id}`)
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete') {
    const selected = currentEdges.value.filter((e) => e.selected)
    if (selected.length > 0) {
      removeEdges(selected)
      console.log('🗑️ Edge(s) supprimé(s) via touche Suppr')
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <div class="w-full h-[80vh] bg-neutral-light border border-neutral-200 rounded-xl overflow-hidden">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      class="w-full h-full"
      :default-edge-options="{
        animated: true,
        style: { stroke: '#2563EB', strokeWidth: 2 },
        markerEnd: 'url(#arrow)',
      }"
      :snap-to-grid="true"
      :fit-view="true"
    >
      <template #edge-markers>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
          </marker>
        </defs>
      </template>
    </VueFlow>
  </div>
</template>