<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
defineProps<NodeProps>()
</script>

<template>
  <div class="bg-green-100 border border-green-400 text-green-900 p-3 rounded-xl shadow w-36 relative text-center">
    🖥️ {{ data.name }}

    <Handle type="source" :position="Position.Right" class="bg-blue-500" />
    <Handle type="target" :position="Position.Left" class="bg-blue-500" />
  </div>
</template>
