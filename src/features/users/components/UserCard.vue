<template>
    <div
      class="bg-white shadow rounded-xl p-4 hover:shadow-lg transition group flex flex-col items-center text-center"
      @click="onEdit"
    >
      <img
        :src="`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`"
        alt="avatar"
        class="w-20 h-20 rounded-full mb-4"
      />
      <div class="text-lg font-semibold">{{ user.firstName }} {{ user.lastName }}</div>
      <div class="text-sm text-neutral-500 mb-2">{{ user.email }}</div>
      <span
        class="px-2 py-1 rounded-full text-xs font-medium text-white"
        :class="user.roleId === 'admin-role-id' ? 'bg-blue-600' : user.roleId === 'tech-role-id' ? 'bg-green-600' : 'bg-gray-600'"
      >
        {{ roles.find(r => r.id === user.roleId)?.name }}
      </span>
      <button
        class="mt-3 px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
      >
        ✏️ Modifier
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Role } from '@/features/roles/types'
  import type { User } from '../types'
  
  const props = defineProps<{
    user: User
    roles: Role[]
  }>()
  
  const emit = defineEmits(['edit'])
  
  const onEdit = () => emit('edit', props.user)
  </script>