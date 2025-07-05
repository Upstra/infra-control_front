<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/store';
import { logout as apiLogout } from '@/features/auth/api';

import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/vue/24/outline';
import UserAvatar from '@/features/users/components/UserAvatar.vue';

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

const toggleDropdown = () => (isOpen.value = !isOpen.value);

const logout = async () => {
  isOpen.value = false;
  try {
    await apiLogout();
  } catch {
    // ignore errors
  }
  auth.resetAuthState();
  router.push('/login');
};

onClickOutside(dropdownRef, () => (isOpen.value = false));
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <UserAvatar
        v-if="auth.currentUser"
        :user="auth.currentUser"
        size="sm"
        pulse
      />
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {{ t('dropdown.welcome') }} {{ auth.currentUser?.firstName }}
      </span>
      <svg
        class="w-4 h-4 text-neutral-500 dark:text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <transition name="fade-slide">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700"
      >
        <ul
          class="text-sm text-neutral-800 divide-y divide-neutral-100 dark:text-neutral-200 dark:divide-neutral-700"
        >
          <li>
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition dark:hover:bg-neutral-700"
              @click="isOpen = false"
            >
              <UserIcon
                class="w-5 h-5 text-neutral-500 dark:text-neutral-400"
              />
              <span>{{ t('dropdown.profile') }}</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/settings"
              class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition dark:hover:bg-neutral-700"
              @click="isOpen = false"
            >
              <Cog6ToothIcon
                class="w-5 h-5 text-neutral-500 dark:text-neutral-400"
              />
              <span>{{ t('dropdown.settings') }}</span>
            </router-link>
          </li>
          <li>
            <button
              @click="logout"
              class="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition w-full text-left dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
            >
              <ArrowRightEndOnRectangleIcon
                class="w-5 h-5 text-red-500 dark:text-red-400"
              />
              <span>{{ t('dropdown.logout') }}</span>
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
