<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Users, ShieldCheck, History as HistoryIcon } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();

const links = [
  { nameKey: 'administration.users', path: '/admin/users', icon: Users },
  { nameKey: 'administration.roles', path: '/admin/roles', icon: ShieldCheck },
  {
    nameKey: 'administration.history',
    path: '/admin/history',
    icon: HistoryIcon,
  },
];

const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-neutral-darker">
      {{ t('administration.section') }}
    </h1>
    <nav class="flex gap-6 border-b border-neutral-200 pb-2">
      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="flex items-center gap-2 pb-2"
        :class="
          isActive(link.path)
            ? 'text-primary border-primary border-b-2'
            : 'text-neutral-500'
        "
      >
        <component :is="link.icon" class="w-4 h-4" />
        <span>{{ t(link.nameKey) }}</span>
      </RouterLink>
    </nav>
    <router-view />
  </div>
</template>

<style scoped>
nav a {
  @apply transition-colors;
}
</style>
