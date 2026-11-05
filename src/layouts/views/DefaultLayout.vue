<script setup lang="ts">
import CommandPalette from '@/components/CommandPalette.vue';
import { SideRail } from '@/shared/components/pulse';
import AppTopBar from '@/layouts/components/AppTopBar.vue';
import MobileNav from '@/layouts/components/MobileNav.vue';
import { useRailItems } from '@/layouts/composables/useRailItems';

const environment = import.meta.env.VITE_ENVIRONMENT_LABEL ?? null;
const { items, user } = useRailItems();
</script>

<template>
  <div class="flex min-h-screen bg-page text-text">
    <SideRail :items="items" :user="user" :environment="environment" />
    <main class="min-w-0 flex-1">
      <MobileNav :items="items" />
      <AppTopBar />
      <div class="px-10 pb-10 max-[759px]:px-4">
        <slot />
      </div>
    </main>
    <CommandPalette />
  </div>
</template>
