<script setup lang="ts">
import type { User } from "../types";
import type { Role } from "@/features/roles/types";
import { PencilIcon, ClipboardIcon } from "@heroicons/vue/24/solid";
import UserAvatar from "@/features/users/components/UserAvatar.vue";
import { useI18n } from 'vue-i18n'

const { users, roles, copiedEmail } = defineProps<{
  users: User[];
  roles: Role[];
  copiedEmail: string | null;
}>();

const emit = defineEmits<{
  (e: "copyEmail", email: string): void;
  (e: "edit", user: User): void;
}>();
const { t } = useI18n();
</script>

<template>
  <div
    class="w-full rounded-xl overflow-hidden shadow ring-1 ring-neutral-200 bg-white">
    <table class="w-full text-sm text-neutral-darker">
      <thead class="bg-neutral-light uppercase text-xs tracking-wider">
        <tr>
          <th class="p-4 text-left">Utilisateur</th>
          <th class="p-4 text-left">Email</th>
          <th class="p-4 text-left">Rôle</th>
          <th class="p-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-t border-neutral-200 hover:bg-neutral-100 transition cursor-pointer">
          <td class="p-4">
            <div class="flex items-center gap-3">
              <UserAvatar :user="user" size="md" pulse />

              <div class="leading-tight">
                <p class="font-semibold">
                  {{ user.firstName }} {{ user.lastName }}
                </p>
                <p class="text-xs text-neutral-500">{{ user.username }}</p>
              </div>
            </div>
          </td>

          <td class="p-4 relative" @click="emit('copyEmail', user.email)">
            <span class="hover:underline">{{ user.email }}</span>
            <transition name="fade">
              <span
                v-if="copiedEmail === user.email"
                class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 text-white text-xs flex items-center justify-center rounded">
                <ClipboardIcon class="w-4 h-4 mr-1" /> Copié
              </span>
            </transition>
          </td>

          <td class="p-4">
            <span
              class="inline-block text-xs font-medium px-2 py-1 rounded-full"
              :class="
                user.roleId === 'admin-role-id'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-200 text-neutral-700'
              ">
              {{ roles.find((r) => r.id === user.roleId)?.name || "Inconnu" }}
            </span>
          </td>

          <td class="p-4 text-center">
            <button
              @click="emit('edit', user)"
              class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-primary text-primary rounded hover:bg-primary hover:text-white transition">
              <PencilIcon class="w-4 h-4" /> {{ t('users.edit_user') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
