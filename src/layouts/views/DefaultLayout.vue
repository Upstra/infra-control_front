<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CommandPalette from '@/components/CommandPalette.vue';
import { SideRail } from '@/shared/components/pulse';
import AppTopBar from '@/layouts/components/AppTopBar.vue';
import MobileNav from '@/layouts/components/MobileNav.vue';
import NotificationBell from '@/features/alerts/components/bell/NotificationBell.vue';
import IncidentZone from '@/features/alerts/components/banner/IncidentZone.vue';
import { criticalBySection } from '@/features/alerts/domain/resource';
import { useRailItems } from '@/layouts/composables/useRailItems';
import { useLiveInfrastructure } from '@/layouts/composables/useLiveInfrastructure';
import { useAuthStore } from '@/features/auth/store';

const DASHBOARD_PATHS = ['/', '/dashboard'];

const environment = import.meta.env.VITE_ENVIRONMENT_LABEL ?? null;
const route = useRoute();
const auth = useAuthStore();
const { alerts } = useLiveInfrastructure();
const { items, user } = useRailItems(() => ({
  critical: criticalBySection(alerts.open),
}));

const signedIn = computed(() => !!auth.token);
const showStrip = computed(
  () => signedIn.value && !DASHBOARD_PATHS.includes(route.path),
);
</script>

<template>
  <div class="flex min-h-screen bg-page text-text">
    <SideRail :items="items" :user="user" :environment="environment" />
    <main class="min-w-0 flex-1">
      <MobileNav :items="items" />
      <AppTopBar>
        <template v-if="signedIn" #actions>
          <NotificationBell />
        </template>
      </AppTopBar>
      <div class="flex flex-col gap-6 px-10 pb-10 max-[759px]:px-4">
        <IncidentZone v-if="showStrip" compact />
        <slot />
      </div>
    </main>
    <CommandPalette />
  </div>
</template>
