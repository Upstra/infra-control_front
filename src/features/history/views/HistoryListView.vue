<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHistoryStore } from '../store';
import PaginationControls from '@/features/users/components/PaginationControls.vue';
import HistoryEventDetail from '../components/HistoryEventDetail.vue';
import { useI18n } from 'vue-i18n';
import { HistoryAction, actionStyles } from '../types';
import { RouterLink } from 'vue-router';
import { entityToPath } from '../types';

const { t } = useI18n();
const historyStore = useHistoryStore();
const {
  events,
  loading,
  totalItems,
  currentPage,
  filters,
  availableEntityTypes,
} = storeToRefs(historyStore);
const { fetchHistory, getAvailableEntityTypes, resetFilters } = historyStore;
const pageSize = 10;
const actions = Object.values(HistoryAction);

const dateError = ref('');
const selectedEvent = ref<any>(null);
const showDetail = ref(false);

const formatDate = (d: string) => {
  const date = new Date(d);
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getActionStyle = (action: string) => {
  return actionStyles[action] || { color: 'text-gray-600', icon: '📝' };
};

const getUserDisplay = (event: any) => {
  if (event.user) {
    const { email, username, firstName, lastName } = event.user;
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      return `${fullName} (${email})`;
    }
    return email || username;
  }

  if (!event.userId) return '-';

  if (event.metadata?.userEmail) {
    return `${event.metadata.userEmail}`;
  }

  return event.userId;
};

const getEntityDisplay = (event: any) => {
  const baseDisplay = `${event.entity}`;

  if (event.entity === 'auth' && event.metadata?.identifier) {
    return `${baseDisplay} (${event.metadata.identifier})`;
  }

  if (event.entityId && event.entityId !== 'unknown') {
    return `${baseDisplay} (${event.entityId})`;
  }

  return baseDisplay;
};

const showEventDetail = (event: any) => {
  selectedEvent.value = event;
  showDetail.value = true;
};

const closeDetail = () => {
  showDetail.value = false;
  selectedEvent.value = null;
};

onMounted(async () => {
  await Promise.all([fetchHistory(), getAvailableEntityTypes()]);
});

watch(
  filters,
  () => {
    dateError.value = '';
    if (
      filters.value.from &&
      filters.value.to &&
      filters.value.to < filters.value.from
    ) {
      dateError.value = t('errors.invalid_date_range');
      return;
    }
    fetchHistory(1, pageSize);
  },
  { deep: true },
);

const applyFilters = () => {
  dateError.value = '';
  if (
    filters.value.from &&
    filters.value.to &&
    filters.value.to < filters.value.from
  ) {
    dateError.value = t('errors.invalid_date_range');
    return;
  }
  fetchHistory(1, pageSize);
};

const hasExtendedData = (event: any) => {
  return (
    event.metadata ||
    event.oldValue ||
    event.newValue ||
    event.ipAddress ||
    event.user
  );
};

const getQuickSummary = (event: any) => {
  const { entity, action, metadata } = event;

  if (entity === 'auth') {
    if (action === 'LOGIN_FAILED' && metadata?.reason) {
      return `Reason: ${metadata.reason}`;
    }
    if (metadata?.loginMethod) {
      return `Method: ${metadata.loginMethod}`;
    }
  }

  if ((entity === 'server' || entity === 'vm') && event.newValue?.name) {
    return event.newValue.name;
  }

  if (entity === 'user_role' && metadata?.targetRoleName) {
    return `Role: ${metadata.targetRoleName}`;
  }

  return null;
};
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-neutral-darker dark:text-white">
      {{ t('administration.history_page_title') }}
    </h2>

    <div class="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow space-y-4">
      <div class="flex flex-wrap gap-3 items-end">
        <select
          class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-600 focus:border-transparent"
          v-model="filters.entity"
          :aria-label="t('administration.history_details.filters.entity')"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="e in availableEntityTypes" :key="e" :value="e">
            {{ e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ') }}
          </option>
        </select>

        <input
          class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-600 focus:border-transparent"
          v-model="filters.userId"
          :placeholder="t('administration.history_details.filters.user')"
        />

        <select
          class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-600 focus:border-transparent"
          v-model="filters.action"
          :aria-label="t('administration.history_details.filters.action')"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="a in actions" :key="a" :value="a">
            {{ a.replace(/_/g, ' ') }}
          </option>
        </select>

        <input
          type="datetime-local"
          class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-600 focus:border-transparent"
          v-model="filters.from"
          :aria-label="t('administration.history_details.filters.from')"
        />

        <input
          type="datetime-local"
          class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-blue-600 focus:border-transparent"
          v-model="filters.to"
          :aria-label="t('administration.history_details.filters.to')"
        />

        <button
          class="px-4 py-2 bg-primary dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          @click="applyFilters"
        >
          {{ t('administration.history_details.filters.apply') }}
        </button>

        <button
          class="px-4 py-2 bg-neutral-light dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors duration-200"
          @click="resetFilters"
        >
          {{ t('common.reset') }}
        </button>

        <div
          v-if="dateError"
          class="w-full text-red-500 dark:text-red-400 text-sm"
        >
          {{ dateError }}
        </div>
      </div>

      <div class="overflow-x-auto relative">
        <table
          class="min-w-full text-sm text-neutral-darker dark:text-gray-300 relative"
        >
          <thead class="bg-neutral-light dark:bg-neutral-700 uppercase text-xs">
            <tr>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.date') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.action') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.entity') }}
              </th>
              <th class="p-3 text-left">
                {{ t('administration.history_details.headers.user') }}
              </th>
              <th class="p-3 text-left">
                {{ t('common.details') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ev, evIdx) in events"
              :key="ev.id"
              class="border-t border-neutral-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150"
            >
              <td class="p-3">{{ formatDate(ev.createdAt) }}</td>
              <td class="p-3">
                <div class="flex flex-col gap-1">
                  <span
                    :class="getActionStyle(ev.action).color"
                    class="flex items-center gap-2"
                  >
                    <span>{{ getActionStyle(ev.action).icon }}</span>
                    <span class="font-medium">{{ ev.action }}</span>
                  </span>
                  <span
                    v-if="getQuickSummary(ev)"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ getQuickSummary(ev) }}
                  </span>
                </div>
              </td>
              <td class="p-3">
                <RouterLink
                  :to="`/${entityToPath[ev.entity]}/${ev.entityId}`"
                  class="text-primary dark:text-blue-400 hover:underline font-medium"
                  v-if="
                    entityToPath[ev.entity] &&
                    ev.entityId &&
                    ev.entityId !== 'unknown'
                  "
                >
                  {{ getEntityDisplay(ev) }}
                </RouterLink>
                <span v-else class="text-gray-600 dark:text-gray-400">
                  {{ getEntityDisplay(ev) }}
                </span>
              </td>
              <td class="p-3">
                <div v-if="ev.user" class="group relative">
                  <span class="cursor-help">{{ getUserDisplay(ev) }}</span>
                  <div
                    :class="[
                      'absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg p-3 w-64 left-0',
                      evIdx === 0 && events.length === 1
                        ? 'top-full mt-8'
                        : evIdx === 0
                          ? 'top-full mt-2'
                          : 'bottom-full mb-2',
                    ]"
                  >
                    <div class="space-y-1">
                      <p>
                        <strong>{{ t('history.details.user_email') }}:</strong>
                        {{ ev.user.email }}
                      </p>
                      <p v-if="ev.user.username">
                        <strong>{{ t('history.details.username') }}:</strong>
                        {{ ev.user.username }}
                      </p>
                      <p v-if="ev.user.roles && ev.user.roles.length > 0">
                        <strong>{{ t('history.details.user_roles') }}:</strong>
                        <span
                          v-for="(role, idx) in ev.user.roles"
                          :key="role.id"
                        >
                          {{ role.name
                          }}<span v-if="role.isAdmin" class="text-yellow-400">
                            ★</span
                          ><span v-if="idx < ev.user.roles.length - 1">, </span>
                        </span>
                      </p>
                      <p>
                        <strong>{{ t('history.details.user_active') }}:</strong>
                        <span v-if="ev.user.active" class="text-green-400"
                          >✓</span
                        >
                        <span v-else class="text-red-400">✗</span>
                      </p>
                    </div>
                    <div
                      v-if="evIdx === 0"
                      class="absolute -top-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-900"
                    ></div>
                    <div
                      v-else
                      class="absolute -bottom-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"
                    ></div>
                  </div>
                </div>
                <span v-else>{{ getUserDisplay(ev) }}</span>
              </td>
              <td class="p-3">
                <button
                  v-if="hasExtendedData(ev)"
                  @click="showEventDetail(ev)"
                  class="text-primary dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  {{ t('common.view_details') }}
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="text-center py-8">
          <div
            class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ t('administration.history_details.loading') }}</span>
          </div>
        </div>

        <div
          v-else-if="!events.length"
          class="text-center py-8 text-neutral-dark dark:text-neutral-400"
        >
          {{ t('administration.history_details.empty') }}
        </div>
      </div>

      <PaginationControls
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @update:page="(p) => fetchHistory(p, pageSize)"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="showDetail"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="closeDetail"
      >
        <div class="max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            @click="closeDetail"
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg z-10"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <HistoryEventDetail v-if="selectedEvent" :event="selectedEvent" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
