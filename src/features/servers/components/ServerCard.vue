<script setup lang="ts">
import type { Server } from '../types';
import { useI18n } from 'vue-i18n';

defineProps<{
  server: Server;
}>();
const { t } = useI18n();
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition cursor-pointer"
  >
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-neutral-darker dark:text-white">
        {{ server.name }}
      </h2>
      <span
        class="px-3 py-1 text-xs font-semibold rounded-full"
        :class="{
          'bg-success/10 text-success': server.state === 'active',
          'bg-danger/10 text-danger': server.state === 'inactive',
        }"
      >
        {{
          server.state === 'active'
            ? t('servers.active')
            : t('servers.inactive')
        }}
      </span>
    </div>

    <div
      class="grid grid-cols-2 gap-x-4 text-sm text-neutral-dark dark:text-neutral-300"
    >
      <div class="space-y-1">
        <p>
          <strong>{{ t('servers.ip') }} :</strong> {{ server.ip }}
        </p>
        <p>
          <strong>{{ t('servers.type') }} :</strong> {{ server.type }}
        </p>
        <p>
          <strong>{{ t('servers.priority') }} :</strong> {{ server.priority }}
        </p>
        <p>
          <strong>{{ t('servers.admin_url') }} :<br /></strong>
          <a
            :href="server.adminUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary dark:text-blue-400 underline truncate"
          >
            {{ server.adminUrl }}
          </a>
        </p>
      </div>

      <div class="space-y-1">
        <p>
          <strong>{{ t('servers.group') }} :</strong> {{ server.groupId }}
        </p>
        <p>
          <strong>{{ t('servers.room') }} :</strong> {{ server.roomId }}
        </p>
        <p>
          <strong>{{ t('servers.ups') }} :</strong> {{ server.upsId || '—' }}
        </p>
        <p>
          <strong>{{ t('servers.shutdown_delay') }} :</strong>
          {{ server.grace_period_off }}s
        </p>
        <p>
          <strong>{{ t('servers.startup_delay') }} :</strong>
          {{ server.grace_period_on }}s
        </p>
      </div>
    </div>

    <div
      v-if="server.ilo"
      class="mt-4 p-3 bg-neutral-light dark:bg-neutral-700 rounded-xl text-sm text-neutral-darker dark:text-neutral-300"
    >
      <h3 class="font-semibold mb-1">{{ t('servers.ilo_section') }}</h3>
      <p>
        <strong>{{ t('servers.ilo_name') }} :</strong> {{ server.ilo.name }}
      </p>
      <p>
        <strong>{{ t('servers.ilo_ip') }} :</strong> {{ server.ilo.ip }}
      </p>
      <p>
        <strong>{{ t('servers.ilo_login') }} :</strong> {{ server.ilo.login }}
      </p>
    </div>
  </div>
</template>
