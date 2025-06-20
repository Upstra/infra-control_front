<template>
  <table class="w-full mt-4 rounded-xl overflow-hidden border shadow-sm bg-white">
    <thead class="bg-neutral-light text-neutral-dark text-sm">
      <tr>
        <th class="p-3 font-semibold text-left">Nom</th>
        <th class="p-3 font-semibold text-left">IP</th>
        <th class="p-3 font-semibold text-left">État</th>
        <th class="p-3"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="vm in vms" :key="vm.id" class="border-b last:border-0 hover:bg-neutral-50 group">
        <td class="p-3 font-mono text-base text-neutral-darker">{{ vm.name }}</td>
        <td class="p-3 font-mono text-sm">{{ vm.ip }}</td>
        <td class="p-3">
          <span :class="vm.state === 'active' ? 'bg-success text-white' : 'bg-danger text-white'"
            class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {{ vm.state === 'active' ? 'Actif' : 'Inactif' }}
          </span>
        </td>
        <td class="p-3 text-right">
          <button @click="$emit('edit', vm)"
            class="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-dark hover:bg-primary/10 hover:text-primary-dark font-semibold text-xs transition">
            Renommer
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
defineProps<{ vms: any[] }>()
</script>
