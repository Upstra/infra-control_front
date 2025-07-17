<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Users, ShieldCheck, History as HistoryIcon, Shuffle } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();

const links = [
  { nameKey: 'administration.users', path: '/admin/users', icon: Users },
  { nameKey: 'administration.roles', path: '/admin/roles', icon: ShieldCheck },
  {
    nameKey: 'administration.migration',
    path: '/admin/migration',
    icon: Shuffle,
  },
  {
    nameKey: 'administration.history',
    path: '/admin/history',
    icon: HistoryIcon,
  },
];

const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1
        class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
      >
        {{ t('administration.section') }}
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.subtitle') }}
      </p>
    </div>

    <nav class="flex gap-1 border-b border-gray-200 dark:border-neutral-700">
      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200"
        :class="
          isActive(link.path)
            ? 'text-primary border-primary font-medium'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
        "
      >
        <component :is="link.icon" class="w-4 h-4" />
        <span class="text-sm">{{ t(link.nameKey) }}</span>
      </RouterLink>
    </nav>

    <div class="mt-6">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<style scoped>
nav a {
  @apply transition-colors;
}
</style>
