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
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ t('roles.assign_users_title', { role: role?.name }) }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ t('roles.assign_users_desc') }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <div class="mb-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
          <div class="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <div v-if="loading" class="p-4">
              <div class="animate-pulse space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
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
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': user.active,
                        'bg-gray-100 text-gray-800': !user.active
                      }"
                    >
                      {{ user.active ? t('roles.active') : t('roles.inactive') }}
                    </span>
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

        <div class="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleAssign"
            :disabled="selectedUserIds.length === 0 || loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers } from '../types';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
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

const { t } = useI18n();

// TODO: call the API
const mockUsers: User[] = [
  { id: '10', username: 'alice.doe', firstName: 'Alice', lastName: 'Doe', email: 'alice.doe@upstra.com', active: true },
  { id: '11', username: 'bob.smith', firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@upstra.com', active: true },
  { id: '12', username: 'charlie.brown', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@upstra.com', active: false },
  { id: '13', username: 'diana.wilson', firstName: 'Diana', lastName: 'Wilson', email: 'diana.wilson@upstra.com', active: true },
  { id: '14', username: 'eve.jones', firstName: 'Eve', lastName: 'Jones', email: 'eve.jones@upstra.com', active: true },
  { id: '15', username: 'frank.miller', firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@upstra.com', active: false },
  { id: '16', username: 'grace.davis', firstName: 'Grace', lastName: 'Davis', email: 'grace.davis@upstra.com', active: true },
  { id: '17', username: 'henry.garcia', firstName: 'Henry', lastName: 'Garcia', email: 'henry.garcia@upstra.com', active: true },
];

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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const assignedUserIds = props.role?.users.map(u => u.id) || [];
    availableUsers.value = mockUsers.filter(user => !assignedUserIds.includes(user.id));
  } finally {
    loading.value = false;
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

onMounted(() => {
  if (props.isOpen) {
    loadAvailableUsers();
  }
});
</script>