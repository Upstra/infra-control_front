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

      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ t('roles.delete_role_title') }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ t('roles.delete_role_confirm', { role: role?.name }) }}
              </p>
              
              <div v-if="role && role.userCount > 0" class="mt-4 p-4 bg-amber-50 rounded-lg">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-amber-800">
                    {{ t('roles.impact_warning') }}
                    </h3>
                    <div class="mt-2 text-sm text-amber-700">
                      <p>
                        {{ t('roles.delete_role_warning', {
                          count: role.userCount,
                          userLabel:
                            role.userCount === 1 ? t('roles.user') : t('roles.users'),
                        }) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="role && role.users.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-900 mb-2">
                  {{ t('roles.affected_users') }}
                </h4>
                <div class="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                  <div class="divide-y divide-gray-200">
                    <div
                      v-for="user in role.users"
                      :key="user.id"
                      class="px-3 py-2 text-sm"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-gray-900">{{ user.firstName }} {{ user.lastName }}</span>
                        <span class="text-gray-500">{{ user.email }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <label for="confirmDelete" class="block text-sm font-medium text-gray-700">
                  {{ t('roles.type_to_confirm', { role: role?.name }) }}
                </label>
                <div class="mt-1">
                  <input
                    id="confirmDelete"
                    v-model="confirmText"
                    type="text"
                    class="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :placeholder="t('roles.type_here', { role: role?.name })"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleConfirm"
            :disabled="!canDelete || loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('roles.delete_role_title') }}
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
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers } from '../types';

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const confirmText = ref('');

const { t } = useI18n();

const canDelete = computed(() => {
  if (!props.role) return false;
  return confirmText.value === props.role.name;
});

const handleConfirm = async () => {
  if (!canDelete.value) return;
  
  loading.value = true;
  try {
    emit('confirm');
  } finally {
    loading.value = false;
  }
};

const close = () => {
  confirmText.value = '';
  emit('close');
};
</script>