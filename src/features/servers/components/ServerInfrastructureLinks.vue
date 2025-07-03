<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { MapPinIcon, BoltIcon } from '@heroicons/vue/24/outline';
import type { Server } from '../types';

interface Props {
  server: Server;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <h3
      class="text-lg font-semibold text-slate-900 flex items-center space-x-2"
    >
      <MapPinIcon class="h-5 w-5 text-emerald-600" />
      <span>{{ t('servers.infrastructure_links') }}</span>
    </h3>

    <div class="bg-slate-50 rounded-xl p-4 space-y-3">
      <div class="space-y-2 text-sm">
        <p>
          <span class="font-medium text-slate-600"
            >{{ t('servers.room') }}:</span
          >
          <router-link
            :to="`/rooms/${server.roomId}`"
            class="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            {{ server.roomId }}
          </router-link>
        </p>
        <p v-if="server.groupId">
          <span class="font-medium text-slate-600"
            >{{ t('servers.group') }}:</span
          >
          <router-link
            :to="`/groups/${server.groupId}`"
            class="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            {{ server.groupId }}
          </router-link>
        </p>
        <p v-if="server.upsId">
          <span class="font-medium text-slate-600"
            >{{ t('servers.ups') }}:</span
          >
          <router-link
            :to="`/ups/${server.upsId}`"
            class="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            {{ server.upsId }}
          </router-link>
        </p>
      </div>
    </div>

    <div v-if="server.ilo" class="space-y-4">
      <h4
        class="text-md font-semibold text-slate-900 flex items-center space-x-2"
      >
        <BoltIcon class="h-4 w-4 text-amber-600" />
        <span>{{ t('servers.ilo_section') }}</span>
      </h4>

      <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div class="space-y-2 text-sm">
          <p>
            <span class="font-medium text-amber-800"
              >{{ t('servers.ilo_name') }}:</span
            >
            <span class="text-amber-900">{{ server.ilo.name }}</span>
          </p>
          <p>
            <span class="font-medium text-amber-800"
              >{{ t('servers.ilo_ip') }}:</span
            >
            <span class="text-amber-900">{{ server.ilo.ip }}</span>
          </p>
          <p>
            <span class="font-medium text-amber-800"
              >{{ t('servers.ilo_login') }}:</span
            >
            <span class="text-amber-900">{{ server.ilo.login }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
