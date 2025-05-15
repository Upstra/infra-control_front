<script setup lang="ts">
import type { User } from '@/features/users/types'
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ user: User | null }>()
</script>

<template>
  <section class="bg-white rounded-xl shadow p-6 border border-neutral-200 space-y-4">
    <h2 class="text-lg font-semibold text-neutral-darker mb-2">Informations générales</h2>
    <dl class="grid grid-cols-1 gap-y-4 text-sm">
      <div class="flex items-center gap-3">
        <UserIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32">Nom d'utilisateur</dt>
        <dd class="text-neutral-600">{{ props.user?.username }}</dd>
      </div>
      <div class="flex items-center gap-3">
        <EnvelopeIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32">Email</dt>
        <dd class="text-neutral-600">{{ props.user?.email }}</dd>
      </div>
      <div class="flex items-center gap-3">
        <CalendarIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32">Créé le</dt>
        <dd class="text-neutral-600">{{ new Date(props.user?.createdAt ?? '').toLocaleDateString() }}</dd>
      </div>
      <div class="flex items-center gap-3">
        <CalendarIcon class="w-5 h-5 text-neutral-400" />
        <dt class="font-medium w-32">Mis à jour</dt>
        <dd class="text-neutral-600">{{ new Date(props.user?.updatedAt ?? '').toLocaleDateString() }}</dd>
      </div>
    </dl>
  </section>
</template>