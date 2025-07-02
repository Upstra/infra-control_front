<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="close"
      ></div>

      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <PlusIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ t('roles.assign_users_title', { role: role?.name }) }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ t('roles.assign_users_desc') }}
              </p>
              <p class="text-xs text-blue-600 mt-1">
                {{ t('roles.multi_role_info') }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <div class="mb-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                :placeholder="t('roles.search_users_placeholder')"
              />
            </div>
          </div>

          <!-- Users List -->
          <div
            ref="scrollContainer"
            class="border border-gray-200 rounded-lg max-h-96 overflow-y-auto"
            @scroll="onScroll"
          >
            <div v-if="loading" class="p-4">
              <div class="animate-pulse space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
              <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">
                {{ t('roles.no_users_found') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{
                  searchQuery
                    ? t('roles.adjust_search')
                    : t('roles.no_available_users')
                }}
              </p>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <label
                v-for="user in filteredUsers"
                :key="user.id"
                class="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  v-model="selectedUserIds"
                  :value="user.id"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div class="ml-3 flex items-center space-x-3 flex-1">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="role in user.roles"
                        :key="role.id"
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          role.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ role.name }}
                      </span>
                      <span
                        v-if="!user.roles || user.roles.length === 0"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {{ t('roles.no_role') }}
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="selectedUserIds.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              {{ selectedUserIds.length }}
              {{ selectedUserIds.length === 1 ? t('roles.user') : t('roles.users') }}
              {{ t('roles.selected') }}
            </p>
          </div>
        </div>

        <div v-if="props.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ props.error }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleAssign"
            :disabled="selectedUserIds.length === 0 || loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white border-2 border-white border-t-transparent rounded-full"></div>
            {{ t('roles.assign') }}
            {{ selectedUserIds.length }}
            {{ selectedUserIds.length === 1 ? t('roles.user') : t('roles.users') }}
          </button>
          <button
            type="button"
            @click="close"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            {{ t('roles.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers } from '../types';
import { useUsers } from '@/features/users/composables/useUsers';
import { useRoles } from '@/features/roles/composables/useRoles';
import type { User } from '@/features/users/types';
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
  error?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'assign', userIds: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const searchQuery = ref('');
const selectedUserIds = ref<string[]>([]);
const availableUsers = ref<User[]>([]);
const page = ref(1);
const pageSize = 10;
const scrollContainer = ref<HTMLElement | null>(null);

const { t } = useI18n();

const { users, loadUsers, totalPages, currentPage } = useUsers();
const { loadRoles } = useRoles();

const filteredUsers = computed(() => {
  if (!searchQuery.value) return availableUsers.value;
  
  const query = searchQuery.value.toLowerCase();
  return availableUsers.value.filter(user => 
    user.firstName.toLowerCase().includes(query) ||
    user.lastName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query)
  );
});

const loadAvailableUsers = async () => {
  loading.value = true;
  try {
    const assignedUserIds = props.role?.users.map((u) => u.id) || [];
    await loadUsers(page.value, pageSize);

    const existing = new Set(availableUsers.value.map((u) => u.id));
    users.value
      .filter((u) => !assignedUserIds.includes(u.id) && !existing.has(u.id))
      .forEach((u) => availableUsers.value.push(u));
  } finally {
    loading.value = false;
  }
};

const onScroll = () => {
  const el = scrollContainer.value;
  if (!el) return;
  if (
    el.scrollTop + el.clientHeight >= el.scrollHeight - 20 &&
    currentPage.value < totalPages.value &&
    !loading.value
  ) {
    page.value += 1;
    loadAvailableUsers();
  }
};

const handleAssign = async () => {
  if (selectedUserIds.value.length === 0) return;
  
  loading.value = true;
  try {
    emit('assign', [...selectedUserIds.value]);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  selectedUserIds.value = [];
  searchQuery.value = '';
  emit('close');
};

onMounted(async () => {
  if (props.isOpen) {
    await loadRoles();
    await loadAvailableUsers();
  }
});

watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      availableUsers.value = [];
      page.value = 1;
      await loadRoles();
      await loadAvailableUsers();
    }
  }
);
</script>

<style lang="scss" scoped>
.max-h-96 {
  max-height: 24rem;
}
</style>
