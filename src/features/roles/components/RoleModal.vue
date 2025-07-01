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
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ isEdit ? t('roles.edit_role') : t('roles.create_role') }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{
                  isEdit
                    ? t('roles.update_role_details')
                    : t('roles.new_role_details')
                }}
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-6">
          <div class="space-y-4">
            <div>
              <label for="roleName" class="block text-sm font-medium text-gray-700">
                {{ t('roles.role_name') }}
              </label>
              <div class="mt-1">
                <input
                  id="roleName"
                  v-model="form.name"
                  type="text"
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  :placeholder="t('roles.role_name_placeholder')"
                />
              </div>
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">
                {{ t('roles.permissions') }}
              </h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="isAdmin"
                    v-model="form.isAdmin"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isAdmin" class="ml-2 block text-sm text-gray-700">
                    {{ t('roles.admin_role') }}
                    <span class="text-gray-500">{{ t('roles.full_access') }}</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="canCreateServer"
                    v-model="form.canCreateServer"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    :disabled="form.isAdmin"
                  />
                  <label for="canCreateServer" class="ml-2 block text-sm text-gray-700">
                    {{ t('roles.can_create_servers') }}
                    <span class="text-gray-500">{{ t('roles.server_creation') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEdit ? t('roles.update_role') : t('roles.create_role') }}
            </button>
            <button
              type="button"
              @click="close"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {{ t('roles.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers, AdminRoleCreationDto } from '../types';

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: AdminRoleCreationDto): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);

const { t } = useI18n();

const form = reactive({
  name: '',
  isAdmin: false,
  canCreateServer: false,
});

const errors = reactive({
  name: '',
});

const isEdit = computed(() => !!props.role);


const resetForm = () => {
  form.name = '';
  form.isAdmin = false;
  form.canCreateServer = false;
  errors.name = '';
};

const validateForm = () => {
  errors.name = '';
  
  if (!form.name.trim()) {
    errors.name = t('roles.role_name_required');
    return false;
  }

  if (form.name.trim().length < 2) {
    errors.name = t('roles.role_name_min');
    return false;
  }
  
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    const roleData: AdminRoleCreationDto = {
      name: form.name.trim(),
      isAdmin: form.isAdmin,
      canCreateServer: form.canCreateServer,
    };
    
    emit('save', roleData);
  } finally {
    loading.value = false;
  }
};

watch(() => props.role, (newRole) => {
  if (newRole) {
    form.name = newRole.name;
    form.isAdmin = newRole.isAdmin;
    form.canCreateServer = newRole.canCreateServer;
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => form.isAdmin, (isAdmin) => {
  if (isAdmin) {
    form.canCreateServer = true;
  }
});

const close = () => {
  resetForm();
  emit('close');
};
</script>