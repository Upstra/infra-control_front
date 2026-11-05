<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/store';
import { logout as apiLogout } from '@/features/auth/api';
import { useUserPreferencesStore } from '@/features/settings/store';

import { User, Settings, LogOut, ChevronDown } from 'lucide-vue-next';
import UserAvatar from '@/features/users/components/UserAvatar.vue';

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const router = useRouter();
const auth = useAuthStore();
const preferencesStore = useUserPreferencesStore();
const { t } = useI18n();

const toggleDropdown = () => (isOpen.value = !isOpen.value);

const logout = async () => {
  isOpen.value = false;
  try {
    await apiLogout();
  } catch {}

  // Nettoyer le cache des préférences
  preferencesStore.clearCache();
  preferencesStore.$reset();

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
      class="flex h-10 items-center gap-2 rounded-md px-2 transition-colors duration-[120ms] hover:bg-surface-raised"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <UserAvatar
        v-if="auth.currentUser"
        :user="auth.currentUser"
        size="sm"
        pulse
      />
      <span class="text-body font-medium text-text max-[759px]:hidden">
        {{ t('dropdown.welcome') }} {{ auth.currentUser?.firstName }}
      </span>
      <ChevronDown class="h-4 w-4 text-text-muted" aria-hidden="true" />
    </button>

    <transition name="fade-slide">
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
      >
        <ul class="divide-y divide-border text-body text-text">
          <li>
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
              @click="isOpen = false"
            >
              <User class="h-5 w-5 text-text-muted" aria-hidden="true" />
              <span>{{ t('dropdown.profile') }}</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/settings"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
              @click="isOpen = false"
            >
              <Settings class="h-5 w-5 text-text-muted" aria-hidden="true" />
              <span>{{ t('dropdown.settings') }}</span>
            </router-link>
          </li>
          <li>
            <button
              @click="logout"
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-danger-text transition-colors hover:bg-danger-surface"
            >
              <LogOut class="h-5 w-5" aria-hidden="true" />
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
