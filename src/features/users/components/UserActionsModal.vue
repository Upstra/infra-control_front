<script setup lang="ts">
import { ref } from "vue";
import type { User } from "../types";
import type { Role } from "@/features/roles/types";
import { onClickOutside } from "@vueuse/core";
import {
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";
import UserAvatar from "@/features/users/components/UserAvatar.vue";

const props = defineProps<{
  user: User | null;
  isOpen: boolean;
  roles: Role[];
}>();

const emit = defineEmits([
  "close",
  "editUser",
  "editRole",
  "deleteUser",
  "resetPassword",
  "toggleUserStatus",
]);

const modalRef = ref<HTMLElement | null>(null);
onClickOutside(modalRef, () => emit("close"));

const handleClose = () => emit("close");
const handleEditUser = () => emit("editUser", props.user);
const handleEditRole = () => emit("editRole", props.user);
const handleDeleteUser = () => emit("deleteUser", props.user);
const handleResetPassword = () => emit("resetPassword", props.user);
const handleToggleStatus = () => emit("toggleUserStatus", props.user);
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 px-4 py-6 sm:px-0">
      <div
        ref="modalRef"
        class="relative bg-white w-full max-w-sm sm:rounded-xl shadow-2xl border border-neutral-200 p-6">
        <button
          @click="handleClose"
          class="absolute top-3 right-3 text-neutral-400 hover:text-neutral-darker transition">
          <XMarkIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 mb-6">
          <UserAvatar v-if="user" :user="user" size="md" pulse />

          <div>
            <h2 class="text-lg font-semibold text-neutral-darker leading-tight">
              {{ user?.username }}
            </h2>
            <p class="text-sm text-neutral-500">
              {{ user?.email }}
            </p>
            <p class="text-xs text-neutral-400">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="handleEditUser"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 hover:bg-primary/10 text-neutral-darker hover:text-primary transition">
            <PencilIcon class="w-5 h-5" />
            Modifier l'utilisateur
          </button>

          <button
            @click="handleEditRole"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 hover:bg-blue-50 text-neutral-darker hover:text-blue-600 transition">
            <ShieldCheckIcon class="w-5 h-5" />
            Modifier le rôle
          </button>

          <button
            @click="handleToggleStatus"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 hover:bg-yellow-50 text-neutral-darker hover:text-yellow-600 transition">
            <ArrowPathIcon class="w-5 h-5" />
            {{ user?.active ? "Désactiver" : "Activer" }} l'utilisateur
          </button>

          <button
            @click="handleResetPassword"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-neutral-100 hover:bg-purple-50 text-neutral-darker hover:text-purple-600 transition">
            <LockClosedIcon class="w-5 h-5" />
            Réinitialiser le mot de passe
          </button>

          <button
            v-if="user?.roleId !== 'admin-role-id'"
            @click="handleDeleteUser"
            class="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
            <TrashIcon class="w-5 h-5" />
            Supprimer l'utilisateur
          </button>

          <button
            @click="handleClose"
            class="w-full px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
