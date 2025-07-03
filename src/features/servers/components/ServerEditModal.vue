<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import type { Server } from '../types';

interface Props {
  show: boolean;
  server: Server | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save'): void;
}

defineProps<Props>();
defineEmits<Emits>();

const { t } = useI18n();
</script>

<template>
  <div
    v-if="show && server"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div
        class="flex items-center justify-between p-6 border-b border-slate-200"
      >
        <h2 class="text-xl font-bold text-slate-900">
          {{ t('servers.edit_title') }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <form class="p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{
              t('servers.name')
            }}</label>
            <input
              v-model="server.name"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{
              t('servers.ip')
            }}</label>
            <input
              v-model="server.ip"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{
              t('servers.type')
            }}</label>
            <select
              v-model="server.type"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="physical">{{ t('servers.physical') }}</option>
              <option value="virtual">{{ t('servers.virtual') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{
              t('servers.priority')
            }}</label>
            <input
              v-model.number="server.priority"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{
              t('servers.admin_url')
            }}</label>
            <input
              v-model="server.adminUrl"
              type="url"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            @click="$emit('save')"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ t('servers.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
