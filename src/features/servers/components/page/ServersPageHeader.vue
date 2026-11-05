<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Plus } from 'lucide-vue-next';
import { LiveBadge } from '@/shared/components/pulse';

const emit = defineEmits<{ add: [] }>();
const { t } = useI18n();
</script>

<template>
  <header class="flex flex-wrap items-center gap-4">
    <div class="flex flex-col gap-1">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="m-0 text-display text-text-strong">
          {{ t('serversPage.title') }}
        </h1>
        <LiveBadge />
      </div>
      <span class="text-text-muted">{{ t('serversPage.subtitle') }}</span>
    </div>
    <div class="flex-1" />
    <button type="button" class="pulse-btn-primary" @click="emit('add')">
      <Plus class="h-4 w-4" aria-hidden="true" />{{ t('serversPage.add') }}
    </button>
  </header>
</template>
